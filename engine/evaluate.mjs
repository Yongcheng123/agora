// engine/evaluate.mjs — score an untrusted solver on a task. PROTECTED.
//
//   lib:   import { evaluate } from './evaluate.mjs'; await evaluate({ taskId, source })
//   CLI:   node engine/evaluate.mjs --task tsp --solver file.js [--out r.json]
//          node engine/evaluate.mjs --batch candidates.json --out scores.json
//
// Every evaluate() call runs in its own child process (heap-capped, killed on an overall timer);
// inside it, the solver runs in engine/sandbox.mjs. Scores are computed here, never by the solver.
import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { performance } from 'node:perf_hooks';
import { TASKS } from '../tasks/index.mjs';
import { FOLDS, geomean, instanceSeed } from '../tasks/rng.mjs';
import { createSandbox } from './sandbox.mjs';

const SELF = fileURLToPath(import.meta.url);
const HEAP_MB = 512;
const CHILD_SLACK_MS = 15000;
const clip = (s, n = 300) => { s = String(s); return s.length > n ? s.slice(0, n - 1) + '…' : s; };
const r6 = (x) => Math.round(x * 1e6) / 1e6;

const failure = (taskId, source, error, ms = 0) => ({
  task: taskId, ok: false, error: clip(error),
  bytes: typeof source === 'string' ? Buffer.byteLength(source, 'utf8') : 0, ms, folds: null,
});

/** Worst-case wall time for one candidate, used for the child's kill timer. */
export function overallTimeoutMs(taskId) {
  const t = TASKS[taskId];
  const n = FOLDS.reduce((a, f) => a + t.instances(f).length, 0);
  return n * t.meta.timeLimitMs + CHILD_SLACK_MS;
}

/** Evaluate in-process (used by the child). Trusts nothing about `source`. */
export function evaluateInProcess({ taskId, source }) {
  const t0 = performance.now();
  const task = TASKS[taskId];
  if (!task) return failure(taskId, source, `unknown task ${taskId}`);
  const { meta } = task;
  const made = createSandbox(source, { entry: meta.entry, timeoutMs: meta.timeLimitMs });
  if (!made.ok) return failure(taskId, source, made.error, Math.round(performance.now() - t0));
  const sb = made.sandbox;

  const folds = {};
  let firstError = null;
  for (const fold of FOLDS) {
    const insts = task.instances(fold), rows = [], ratios = [];
    let failed = 0;
    insts.forEach((inst, i) => {
      const seed = instanceSeed(taskId, fold, i) ^ 0xa5a5a5a5;
      const res = meta.online ? runOnline(task, sb, inst, seed) : runOffline(task, sb, inst, seed);
      const base = task.baseline(inst);
      if (!res.ok) {
        failed++;
        if (!firstError) firstError = `${fold}#${i}: ${res.error}`;
        rows.push({ ok: false, error: clip(res.error, 200), ratio: null, cost: null, baseline: base, ms: res.ms });
        return;
      }
      const ratio = meta.direction === 'min' ? res.cost / base : base / res.cost;
      ratios.push(ratio);
      rows.push({ ok: true, ratio: r6(ratio), cost: r6(res.cost), baseline: r6(base), ms: res.ms });
    });
    folds[fold] = { score: failed ? null : r6(geomean(ratios)), failed, instances: rows };
  }
  const ms = Math.round(performance.now() - t0);
  const bytes = Buffer.byteLength(source, 'utf8');
  if (firstError) return { task: taskId, ok: false, error: clip(firstError), bytes, ms, folds };
  return { task: taskId, ok: true, error: null, bytes, ms, folds };
}

function parseOut(json) {
  try { return { ok: true, value: JSON.parse(json) }; } catch { return { ok: false, error: 'output is not valid JSON' }; }
}

function runOffline(task, sb, inst, seed) {
  const { meta } = task;
  const args = task.args(inst);
  const t0 = performance.now();
  const out = sb.call(JSON.stringify(args), { seed, timeoutMs: meta.timeLimitMs });
  const ms = Math.round(performance.now() - t0);
  if (!out.ok) return { ok: false, error: out.error, ms };
  const p = parseOut(out.json);
  if (!p.ok) return { ok: false, error: p.error, ms };
  const v = task.verify(inst, p.value);
  return v.ok ? { ok: true, cost: v.cost, ms } : { ok: false, error: 'invalid output: ' + v.error, ms };
}

// Online protocol: one sandbox call per item carrying ONLY the current size and a copy of the
// current bins. The item list stays on the host.
function runOnline(task, sb, inst, seed) {
  const { meta } = task;
  const bins = [], decisions = [];
  sb.seed(seed);
  const t0 = performance.now();
  for (const size of task.stream(inst)) {
    const left = meta.timeLimitMs - (performance.now() - t0);
    if (left <= 0) return { ok: false, error: 'timeout', ms: Math.round(performance.now() - t0) };
    const out = sb.call(JSON.stringify([size, bins]), { timeoutMs: left });
    if (!out.ok) return { ok: false, error: out.error, ms: Math.round(performance.now() - t0) };
    const p = parseOut(out.json);
    if (!p.ok) return { ok: false, error: p.error, ms: Math.round(performance.now() - t0) };
    const e = task.check(size, bins, p.value);
    if (e) return { ok: false, error: `invalid output at item ${decisions.length}: ${e}`, ms: Math.round(performance.now() - t0) };
    task.apply(size, bins, p.value);
    decisions.push(p.value);
  }
  const ms = Math.round(performance.now() - t0);
  const v = task.verify(inst, decisions); // independent replay
  return v.ok ? { ok: true, cost: v.cost, ms } : { ok: false, error: 'invalid output: ' + v.error, ms };
}

/** Public API: evaluate one candidate in an isolated child process. Never throws. */
export function evaluate({ taskId, source }) {
  if (!TASKS[taskId]) return Promise.resolve(failure(taskId, source, `unknown task ${taskId}`));
  if (typeof source !== 'string') return Promise.resolve(failure(taskId, source, 'source is not a string'));
  const limit = overallTimeoutMs(taskId);
  const t0 = performance.now();
  return new Promise((resolve) => {
    const child = spawn(process.execPath, [`--max-old-space-size=${HEAP_MB}`, SELF, '--child'], {
      stdio: ['pipe', 'pipe', 'pipe'], env: { PATH: process.env.PATH || '' },
    });
    let out = '', err = '', done = false;
    const finish = (r) => { if (!done) { done = true; clearTimeout(timer); resolve(r); } };
    const timer = setTimeout(() => { child.kill('SIGKILL'); finish(failure(taskId, source, `overall timeout after ${limit} ms`, Math.round(performance.now() - t0))); }, limit);
    child.stdout.on('data', (d) => { if (out.length < 8e6) out += d; });
    child.stderr.on('data', (d) => { if (err.length < 4000) err += d; });
    child.on('error', (e) => finish(failure(taskId, source, 'spawn failed: ' + e.message)));
    child.on('close', (code, signal) => {
      const ms = Math.round(performance.now() - t0);
      try {
        const r = JSON.parse(out);
        if (r && typeof r === 'object' && r.task === taskId) return finish(r);
      } catch { /* fall through */ }
      const why = /heap out of memory|Allocation failed/i.test(err) ? 'out of memory' : `evaluator exited (code ${code}, signal ${signal})`;
      finish(failure(taskId, source, why + (err && !/memory/.test(why) ? ': ' + err.trim().split('\n').pop() : ''), ms));
    });
    child.stdin.on('error', () => {});
    child.stdin.end(JSON.stringify({ taskId, source }));
  });
}

async function childMain() {
  let input = '';
  for await (const chunk of process.stdin) input += chunk;
  let req;
  try { req = JSON.parse(input); } catch { req = {}; }
  let res;
  try { res = evaluateInProcess({ taskId: req.taskId, source: req.source }); } catch (e) { res = failure(req.taskId, req.source, 'evaluator error: ' + (e && e.message)); }
  process.stdout.write(JSON.stringify(res));
}

function parseArgs(argv) {
  const o = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith('--')) { const k = a.slice(2); o[k] = argv[i + 1] && !argv[i + 1].startsWith('--') ? argv[++i] : true; }
  }
  return o;
}

async function cliMain() {
  const o = parseArgs(process.argv.slice(2));
  if (o.child) return childMain();
  if (o.batch) {
    const cands = JSON.parse(fs.readFileSync(o.batch, 'utf8'));
    const scores = {};
    for (const c of Array.isArray(cands) ? cands : []) {
      const key = String(c.key ?? c.task);
      scores[key] = await evaluate({ taskId: c.task, source: c.source });
      process.stderr.write(`${key}: ${scores[key].ok ? `holdout ${scores[key].folds.holdout.score} train ${scores[key].folds.train.score}` : 'FAIL ' + scores[key].error} (${scores[key].ms} ms)\n`);
    }
    const text = JSON.stringify(scores, null, 2) + '\n';
    if (o.out) { fs.mkdirSync(path.dirname(path.resolve(o.out)), { recursive: true }); fs.writeFileSync(o.out, text); } else process.stdout.write(text);
    return;
  }
  if (!o.task || !o.solver) {
    process.stderr.write('usage: evaluate.mjs --task <id> --solver <file> [--out r.json] | --batch candidates.json --out scores.json\n');
    process.exit(2);
  }
  const r = await evaluate({ taskId: o.task, source: fs.readFileSync(o.solver, 'utf8') });
  const text = JSON.stringify(r, null, 2) + '\n';
  if (o.out) fs.writeFileSync(o.out, text); else process.stdout.write(text);
  process.exitCode = r.ok ? 0 : 1;
}

if (process.argv[1] && path.resolve(process.argv[1]) === SELF) await cliMain();
