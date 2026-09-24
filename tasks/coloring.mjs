// tasks/coloring.mjs — graph colouring on random G(n, p). PROTECTED.
import { mulberry32, instanceSeed, randInt } from './rng.mjs';

const PER_FOLD = 8;
const PS = [0.05, 0.1, 0.2, 0.3, 0.5, 0.15, 0.25, 0.4];

// Baseline = greedy in index order (smallest colour not used by an earlier neighbour). Also the starter.
function solve(n, edges) {
  const adj = Array.from({ length: n }, () => []);
  for (const [u, v] of edges) { adj[u].push(v); adj[v].push(u); }
  const colors = new Array(n).fill(-1);
  for (let v = 0; v < n; v++) {
    const used = new Set();
    for (const u of adj[v]) if (colors[u] >= 0) used.add(colors[u]);
    let c = 0;
    while (used.has(c)) c++;
    colors[v] = c;
  }
  return colors;
}

export const meta = {
  id: 'coloring',
  title: '图着色',
  entry: 'solve',
  signature: 'solve(n: number, edges: [u, v][]) → number[]  // colour of each vertex',
  metric: '颜色数 ÷ 贪心基线',
  direction: 'min',
  timeLimitMs: 1000,
  budgetHintMs: 250,
  spec: [
    'Task: proper vertex colouring of a random graph G(n, p) (n ≈ 150, p varies from 0.05 to 0.5 across instances).',
    'Define a top-level function `solve(n, edges)`:',
    '- `n`: number of vertices, labelled 0..n-1.',
    '- `edges`: array of [u, v] pairs with 0 <= u < v < n, no duplicates.',
    '- Return an array `colors` of length n of non-negative integers such that colors[u] !== colors[v] for every edge.',
    'An improper colouring or malformed output fails the whole evaluation.',
    'Objective: minimise the number of distinct colours used. Score = geometric mean over instances of colours / colours(greedy in index order); lower is better, 1.0 = baseline.',
    'Pure JavaScript, no imports, no I/O, no eval/new Function. Math.random is seeded (deterministic). Aim for at most 250 ms per instance (hard cap 1000 ms; exceeding it fails the evaluation). Prefer iteration-count limits over wall-clock checks.',
  ].join('\n'),
};

export const starter = solve.toString() + '\n';

const cache = {};
export function instances(fold) {
  if (!cache[fold]) {
    cache[fold] = Array.from({ length: PER_FOLD }, (_, i) => {
      const r = mulberry32(instanceSeed('coloring', fold, i));
      const n = randInt(r, 140, 160), p = PS[i % PS.length];
      const edges = [];
      for (let u = 0; u < n; u++) for (let v = u + 1; v < n; v++) if (r() < p) edges.push([u, v]);
      return { n, p, edges };
    });
  }
  return cache[fold];
}

export function verify(inst, output) {
  const { n, edges } = inst;
  if (!Array.isArray(output) || output.length !== n) return { ok: false, error: `expected ${n} colours` };
  for (let i = 0; i < n; i++) if (!Number.isInteger(output[i]) || output[i] < 0) return { ok: false, error: `vertex ${i}: invalid colour` };
  for (const [u, v] of edges) if (output[u] === output[v]) return { ok: false, error: `edge ${u}-${v} has both ends colour ${output[u]}` };
  return { ok: true, cost: new Set(output).size };
}

export function baseline(inst) { return new Set(solve(inst.n, inst.edges)).size; }

/** Arguments passed to solve(), in order. */
export const args = (inst) => [inst.n, inst.edges];
