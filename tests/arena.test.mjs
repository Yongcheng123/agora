// tests/arena.test.mjs — tasks, sandbox and evaluator.
import test from 'node:test';
import assert from 'node:assert/strict';
import { TASKS } from '../tasks/index.mjs';
import { evaluate } from '../engine/evaluate.mjs';
import { createSandbox } from '../engine/sandbox.mjs';

const IDS = ['binpack', 'tsp', 'coloring', 'knapsack'];

// ---------- reference "better" solvers (what a good generation might look like) ----------
const BETTER = {
  binpack: `function place(size, bins) { // best fit
  let best = -1, left = Infinity;
  for (let i = 0; i < bins.length; i++) { const r = bins[i] - size; if (r >= -1e-9 && r < left) { left = r; best = i; } }
  return best;
}`,
  tsp: `function solve(points) { // nearest neighbour + 2-opt
  const n = points.length, d = (a, b) => Math.hypot(points[a][0] - points[b][0], points[a][1] - points[b][1]);
  const used = new Array(n).fill(false), t = [0]; used[0] = true;
  for (let k = 1; k < n; k++) { const c = t[k - 1]; let b = -1, bd = Infinity;
    for (let j = 0; j < n; j++) if (!used[j]) { const x = d(c, j); if (x < bd) { bd = x; b = j; } }
    used[b] = true; t.push(b); }
  let improved = true, rounds = 0;
  while (improved && rounds++ < 50) { improved = false;
    for (let i = 0; i < n - 1; i++) for (let j = i + 2; j < n; j++) {
      const a = t[i], b = t[i + 1], c = t[j], e = t[(j + 1) % n];
      if (a === e) continue;
      if (d(a, c) + d(b, e) < d(a, b) + d(c, e) - 1e-9) {
        for (let l = i + 1, r = j; l < r; l++, r--) { const tmp = t[l]; t[l] = t[r]; t[r] = tmp; }
        improved = true; } } }
  return t;
}`,
  coloring: `function solve(n, edges) { // DSATUR
  const adj = Array.from({ length: n }, () => []);
  for (const [u, v] of edges) { adj[u].push(v); adj[v].push(u); }
  const col = new Array(n).fill(-1), sat = Array.from({ length: n }, () => new Set());
  for (let k = 0; k < n; k++) {
    let best = -1;
    for (let v = 0; v < n; v++) if (col[v] < 0 && (best < 0 || sat[v].size > sat[best].size || (sat[v].size === sat[best].size && adj[v].length > adj[best].length))) best = v;
    let c = 0; while (sat[best].has(c)) c++;
    col[best] = c; for (const u of adj[best]) sat[u].add(c);
  }
  return col;
}`,
  knapsack: `function solve(items, caps) { // greedy + 1-1 swap / add local search
  const m = caps.length, n = items.length;
  const eff = items.map((it, i) => { let w = 0; for (let j = 0; j < m; j++) w += it.w[j] / caps[j]; return [it.v / w, i]; });
  eff.sort((a, b) => b[0] - a[0] || a[1] - b[1]);
  const used = new Array(m).fill(0), inS = new Array(n).fill(false);
  const fitsWith = (add, rem) => { for (let j = 0; j < m; j++) if (used[j] + (add >= 0 ? items[add].w[j] : 0) - (rem >= 0 ? items[rem].w[j] : 0) > caps[j]) return false; return true; };
  const put = (i, s) => { inS[i] = s > 0; for (let j = 0; j < m; j++) used[j] += s * items[i].w[j]; };
  for (const [, i] of eff) if (fitsWith(i, -1)) put(i, 1);
  let improved = true, iter = 0;
  while (improved && iter++ < 200) { improved = false;
    for (let a = 0; a < n && !improved; a++) if (!inS[a]) {
      if (fitsWith(a, -1)) { put(a, 1); improved = true; break; }
      for (let r = 0; r < n; r++) if (inS[r] && items[a].v > items[r].v && fitsWith(a, r)) { put(r, -1); put(a, 1); improved = true; break; } } }
  const out = []; for (let i = 0; i < n; i++) if (inS[i]) out.push(i); return out;
}`,
};

// ---------- tasks ----------
test('task modules satisfy the contract and instances are deterministic', () => {
  for (const id of IDS) {
    const t = TASKS[id];
    assert.equal(t.meta.id, id);
    for (const k of ['title', 'entry', 'signature', 'metric', 'spec']) assert.equal(typeof t.meta[k], 'string', `${id}.${k}`);
    assert.ok(['min', 'max'].includes(t.meta.direction));
    assert.ok(t.meta.timeLimitMs > 0 && t.meta.budgetHintMs > 0);
    assert.equal(typeof t.starter, 'string');
    assert.ok(t.starter.includes(t.meta.entry));
    for (const fold of ['train', 'holdout']) {
      const a = t.instances(fold);
      assert.equal(a.length, 8);
      assert.equal(JSON.stringify(a), JSON.stringify(JSON.parse(JSON.stringify(a)))); // plain JSON
      for (const inst of a) assert.ok(t.baseline(inst) > 0);
    }
    assert.notEqual(JSON.stringify(t.instances('train')), JSON.stringify(t.instances('holdout')));
  }
});

// ---------- scores ----------
for (const id of IDS) {
  test(`${id}: starter scores exactly 1.0 on both folds`, async () => {
    const r = await evaluate({ taskId: id, source: TASKS[id].starter });
    assert.equal(r.ok, true, r.error);
    assert.equal(r.folds.train.score, 1);
    assert.equal(r.folds.holdout.score, 1);
    assert.equal(r.folds.train.failed, 0);
  });

  test(`${id}: a better solver scores < 1 and is deterministic`, async () => {
    const a = await evaluate({ taskId: id, source: BETTER[id] });
    const b = await evaluate({ taskId: id, source: BETTER[id] });
    assert.equal(a.ok, true, a.error);
    assert.ok(a.folds.holdout.score < 1, `holdout ${a.folds.holdout.score}`);
    assert.ok(a.folds.train.score < 1, `train ${a.folds.train.score}`);
    assert.equal(a.folds.holdout.score, b.folds.holdout.score);
    assert.equal(a.folds.train.score, b.folds.train.score);
    console.log(`  ${id} better: train ${a.folds.train.score} holdout ${a.folds.holdout.score} (${a.ms} ms)`);
  });
}

test('seeded Math.random makes randomized solvers deterministic', async () => {
  const src = `function solve(points) { const t = points.map((_, i) => i);
    for (let i = t.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); const x = t[i]; t[i] = t[j]; t[j] = x; } return t; }`;
  const a = await evaluate({ taskId: 'tsp', source: src });
  const b = await evaluate({ taskId: 'tsp', source: src });
  assert.equal(a.ok, true, a.error);
  assert.ok(a.folds.holdout.score > 1);
  const costs = (r) => ['train', 'holdout'].flatMap((f) => r.folds[f].instances.map((x) => x.cost));
  assert.deepEqual(costs(a), costs(b));
});

// ---------- adversarial ----------
const bad = (name, taskId, source, re) => test(`adversarial: ${name}`, async () => {
  const r = await evaluate({ taskId, source });
  assert.equal(r.ok, false, `expected failure, got ${JSON.stringify(r.folds && r.folds.holdout.score)}`);
  if (re) assert.match(r.error, re);
  assert.ok(r.error.length <= 300);
});

bad('infinite loop → timeout', 'tsp', 'function solve(p) { for (;;) {} }', /timeout/);
bad('infinite loop at load time', 'tsp', 'for (;;) {}\nfunction solve(p) { return []; }', /timeout/);
bad('infinite loop in binpack place()', 'binpack', 'function place(s, b) { if (b.length > 3) for (;;) {} return -1; }', /timeout/);
bad('async microtask loop is still timed', 'tsp', 'function solve(p) { const f = () => Promise.resolve().then(f); f(); return p.map((_, i) => i); }', /timeout/);
bad('invalid output (not a permutation)', 'tsp', 'function solve(p) { return p.map(() => 0); }', /invalid output/);
bad('invalid output (undefined)', 'coloring', 'function solve(n, e) { }', /output/);
bad('improper colouring', 'coloring', 'function solve(n, e) { return new Array(n).fill(0); }', /invalid output/);
bad('knapsack over capacity', 'knapsack', 'function solve(items) { return items.map((_, i) => i); }', /capacity/);
bad('binpack overfull bin', 'binpack', 'function place(s, b) { return b.length ? 0 : -1; }', /invalid output/);
bad('binpack non-integer decision', 'binpack', 'function place(s, b) { return "0"; }', /invalid output/);
bad('missing entry function', 'tsp', 'function solver(p) { return []; }', /does not define/);
bad('syntax error', 'tsp', 'function solve(p) { return [ }', /compile error/);
bad('throws', 'knapsack', 'function solve() { throw new Error("boom"); }', /boom/);
bad('constructor.constructor escape', 'tsp', `function solve(p) { const proc = this.constructor.constructor('return process')(); proc.exit(0); return []; }`);
bad('({}).constructor.constructor escape', 'tsp', `function solve(p) { const proc = ({}).constructor.constructor('return process')(); return proc.pid ? p.map((_, i) => i) : []; }`, /Code generation from strings disallowed|EvalError/i);
bad('eval blocked', 'tsp', 'function solve(p) { return eval("p.map((_, i) => i)"); }', /Code generation|eval/i);
bad('new Function blocked', 'tsp', 'function solve(p) { return new Function("p", "return p.map((_, i) => i)")(p); }', /Code generation/i);
bad('async function constructor blocked', 'tsp', 'function solve(p) { const AF = (async () => {}).constructor; AF("return 1"); return p.map((_, i) => i); }', /Code generation/i);
bad('no process / require / globalThis leaks', 'tsp', `function solve(p) {
  if (typeof process !== 'undefined' || typeof require !== 'undefined' || typeof setTimeout !== 'undefined' || typeof fetch !== 'undefined') return p.map((_, i) => i);
  throw new Error('no host globals'); }`, /no host globals/);
bad('huge output rejected', 'tsp', 'function solve(p) { return new Array(3e5).fill(123456); }', /too large/);
bad('getter-bearing throw cannot run on host', 'tsp', `function solve(p) { throw { get message() { for (;;) {} } }; }`, /timeout/);
bad('proxy throw', 'tsp', 'function solve(p) { throw new Proxy({}, { get() { for(;;){} }, getOwnPropertyDescriptor() { for(;;){} } }); }', /timeout|thrown|error/);
bad('memory bomb', 'tsp', 'function solve(p) { const a = []; for (;;) a.push(new Array(1e6).fill(1)); }');
bad('cannot hijack the harness', 'tsp', `var __agora = { call() { return '=[]'; } }; __agora_in = 1;
  Object.defineProperty(globalThis, '__agora_in', { get() { for(;;){} } }); function solve(p) { return p.map((_, i) => i); }`);

test('binpack solver cannot see future items', async () => {
  // A solver that hunts for any array longer than the current bins count, or any global
  // that holds the item list, would find it here. It records everything it can reach.
  const src = `var seen = 0, maxArgs = 0;
  function place(size, bins) {
    maxArgs = Math.max(maxArgs, arguments.length);
    const names = Object.getOwnPropertyNames(globalThis);
    for (const k of names) { let v; try { v = globalThis[k]; } catch (e) { continue; }
      if (Array.isArray(v) && v.length >= 100) throw new Error('leak via global ' + k); }
    if (maxArgs !== 2) throw new Error('extra arguments');
    if (typeof size !== 'number' || !Array.isArray(bins)) throw new Error('bad types');
    if (bins.length === 0) seen = 0;
    seen++;
    for (let i = 0; i < bins.length; i++) if (bins[i] >= size - 1e-9) return i;
    return -1;
  }`;
  const r = await evaluate({ taskId: 'binpack', source: src });
  assert.equal(r.ok, true, r.error);
  assert.equal(r.folds.holdout.score, 1); // identical to First Fit
  // and structurally: the sandbox input for one call is exactly [size, bins]
  const mk = createSandbox('function place(s, b) { return [arguments.length, typeof s, b.length]; }', { entry: 'place' });
  assert.ok(mk.ok);
  const out = mk.sandbox.call(JSON.stringify([0.5, [0.2, 0.3]]));
  assert.deepEqual(JSON.parse(out.json), [2, 'number', 2]);
});

test('sandbox returns only strings and has no host prototypes', () => {
  const mk = createSandbox(`function solve() { return [Object.getPrototypeOf(Object.getPrototypeOf(globalThis)) === Object.prototype || Object.getPrototypeOf(globalThis) === Object.prototype, typeof Buffer, typeof console]; }`, { entry: 'solve' });
  assert.ok(mk.ok, mk.error);
  const out = mk.sandbox.call('[]');
  assert.equal(typeof out.json, 'string');
  assert.deepEqual(JSON.parse(out.json), [true, 'undefined', 'undefined']);
});

test('batch CLI writes scores keyed by candidate', async () => {
  const { spawnSync } = await import('node:child_process');
  const fs = await import('node:fs');
  const os = await import('node:os');
  const path = await import('node:path');
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'agora-'));
  fs.writeFileSync(path.join(dir, 'c.json'), JSON.stringify([
    { key: 'a', task: 'coloring', source: TASKS.coloring.starter },
    { key: 'b', task: 'tsp', source: 'nope(' },
  ]));
  const p = spawnSync(process.execPath, ['engine/evaluate.mjs', '--batch', path.join(dir, 'c.json'), '--out', path.join(dir, 's.json')], { encoding: 'utf8' });
  assert.equal(p.status, 0, p.stderr);
  const s = JSON.parse(fs.readFileSync(path.join(dir, 's.json'), 'utf8'));
  assert.equal(s.a.ok, true); assert.equal(s.a.folds.holdout.score, 1);
  assert.equal(s.b.ok, false);
  fs.rmSync(dir, { recursive: true, force: true });
});
