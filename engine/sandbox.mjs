// engine/sandbox.mjs — runs untrusted solver source in a node:vm context. PROTECTED.
//
// Trust boundary:
//  - A fresh context per candidate, whose global is a null-prototype object holding only
//    ECMAScript intrinsics. Code generation from strings and wasm is disabled, so the
//    context's own Function/eval cannot compile anything.
//  - No host object or function is ever placed in the context (a host function would leak the
//    host Function constructor). The host only writes a primitive string to one global slot and
//    evaluates short fixed scripts; every result that comes back is a primitive string that the
//    host checks with `typeof` before touching.
//  - The harness (prelude) runs before the solver, captures the intrinsics it needs, installs a
//    seeded Math.random, and exposes a frozen, non-configurable `__agora` object.
//  - Every entry into the context carries a timeout; microtaskMode 'afterEvaluate' keeps queued
//    promise jobs inside that timeout too.
//  - Exceptions are caught INSIDE the context and turned into strings there, so the host never
//    reads a property of a sandbox object (which could be a getter).
// This process is still disposable: engine/evaluate.mjs runs it in a child process with a heap cap
// and an overall kill timer, and CI runs that inside `docker --network none`.
import vm from 'node:vm';
import { types } from 'node:util';

export const MAX_SOURCE_BYTES = 64 * 1024;
export const MAX_OUTPUT_CHARS = 1 << 20; // 1 MiB of JSON per call

const PRELUDE = `(function (g) {
  'use strict';
  var JP = JSON.parse, JS = JSON.stringify, RA = Reflect.apply, STR = String;
  var slice = String.prototype.slice, defineProperty = Object.defineProperty, freeze = Object.freeze;
  var imul = Math.imul, MAXOUT = ${MAX_OUTPUT_CHARS};
  var state = 1;
  function random() {
    state = (state + 0x6d2b79f5) >>> 0;
    var t = state;
    t = imul(t ^ (t >>> 15), t | 1);
    t ^= t + imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }
  // V8 puts a context-local console in every context; it is harmless but useless, so remove it.
  try { delete g.console; } catch (_) {}
  defineProperty(Math, 'random', { value: random, writable: false, configurable: false, enumerable: false });
  function describe(e) {
    var m;
    try { m = (e !== null && typeof e === 'object' && 'message' in e) ? STR(e.message) : STR(e); } catch (_) { m = 'thrown value could not be described'; }
    if (typeof m !== 'string') m = 'error';
    return RA(slice, m, [0, 300]);
  }
  var api = freeze({
    seed: function (n) { state = n >>> 0; return 'ok'; },
    call: function (entry) {
      try {
        var input = g.__agora_in;
        if (typeof input !== 'string') return '!input missing';
        var args = JP(input);
        var f = g[entry];
        if (typeof f !== 'function') return '!entry function ' + entry + ' is not defined';
        var r = RA(f, undefined, args);
        var out = JS(r);
        if (typeof out !== 'string') return '!output is not JSON-serialisable (got ' + (typeof r) + ')';
        if (out.length > MAXOUT) return '!output too large (' + out.length + ' chars)';
        return '=' + out;
      } catch (e) {
        return '!' + describe(e);
      }
    },
    probe: function (entry) { return typeof g[entry]; },
  });
  // The host writes inputs into this slot; make it a plain data property forever so the solver
  // can never turn it into an accessor that would run solver code on the host's stack.
  defineProperty(g, '__agora_in', { value: undefined, writable: true, configurable: false, enumerable: false });
  defineProperty(g, '__agora', { value: api, writable: false, configurable: false, enumerable: false });
})(this);`;

const clip = (s, n = 300) => (s.length > n ? s.slice(0, n - 1) + '…' : s);

function hostError(e) {
  // Errors thrown by vm itself (timeout, SyntaxError while compiling) are host objects, or
  // context objects we produced from a compile step. Only read `code`/`message` when they are
  // plain data properties.
  if (e && (typeof e === 'object' || typeof e === 'function')) {
    if (types.isProxy(e)) return 'threw a proxy';
    const d = Object.getOwnPropertyDescriptor(e, 'code');
    if (d && d.value === 'ERR_SCRIPT_EXECUTION_TIMEOUT') return 'timeout';
    const m = Object.getOwnPropertyDescriptor(e, 'message');
    if (m && typeof m.value === 'string') return clip(m.value);
  }
  return 'error';
}

/**
 * Create a sandbox from untrusted solver source.
 * Returns { ok: true, sandbox } or { ok: false, error }.
 * sandbox.call(argsJson: string, { seed, timeoutMs }) → { ok: true, json: string } | { ok: false, error }
 */
export function createSandbox(source, { entry, timeoutMs = 2000 } = {}) {
  if (typeof source !== 'string') return { ok: false, error: 'source is not a string' };
  if (Buffer.byteLength(source, 'utf8') > MAX_SOURCE_BYTES) return { ok: false, error: `source exceeds ${MAX_SOURCE_BYTES} bytes` };
  if (typeof entry !== 'string' || !/^[A-Za-z_$][\w$]*$/.test(entry)) return { ok: false, error: 'bad entry name' };

  const ctx = vm.createContext(Object.create(null), {
    name: 'agora-solver',
    codeGeneration: { strings: false, wasm: false },
    microtaskMode: 'afterEvaluate',
  });
  const run = (code, ms, filename) => vm.runInContext(code, ctx, { timeout: Math.max(1, Math.ceil(ms)), filename, breakOnSigint: false });

  try { run(PRELUDE, 1000, 'agora-prelude.js'); } catch (e) { return { ok: false, error: 'prelude failed: ' + hostError(e) }; }

  let script;
  try { script = new vm.Script(source, { filename: 'solver.js' }); } catch (e) { return { ok: false, error: 'compile error: ' + hostError(e) }; }
  try {
    run(`__agora.seed(0x5eed); 'ok'`, 100, 'agora-seed.js');
    script.runInContext(ctx, { timeout: Math.max(1, Math.ceil(timeoutMs)) });
  } catch (e) {
    return { ok: false, error: 'load error: ' + (hostError(e) === 'timeout' ? 'timeout while loading' : hostError(e)) };
  }

  let t;
  try { t = run(`__agora.probe(${JSON.stringify(entry)})`, 100, 'agora-probe.js'); } catch (e) { return { ok: false, error: 'probe failed: ' + hostError(e) }; }
  if (t !== 'function') return { ok: false, error: `source does not define function ${entry}` };

  const callScript = new vm.Script(`__agora.call(${JSON.stringify(entry)})`, { filename: 'agora-call.js' });
  const sandbox = {
    seed(n) { run(`__agora.seed(${(n >>> 0)})`, 100, 'agora-seed.js'); },
    call(argsJson, { seed, timeoutMs: ms = timeoutMs } = {}) {
      if (typeof argsJson !== 'string') throw new TypeError('argsJson must be a string');
      try {
        if (seed !== undefined) sandbox.seed(seed);
        ctx.__agora_in = argsJson; // primitive only
        const res = callScript.runInContext(ctx, { timeout: Math.max(1, Math.ceil(ms)) });
        ctx.__agora_in = undefined;
        if (typeof res !== 'string' || res.length === 0) return { ok: false, error: 'sandbox returned a non-string' };
        if (res[0] === '=') return { ok: true, json: res.slice(1) };
        return { ok: false, error: clip(res.slice(1)) };
      } catch (e) {
        return { ok: false, error: hostError(e) };
      }
    },
  };
  return { ok: true, sandbox };
}
