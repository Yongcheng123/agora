// tasks/knapsack.mjs — multi-dimensional 0/1 knapsack (5 constraints). PROTECTED.
import { mulberry32, instanceSeed, randInt, uniform } from './rng.mjs';

const PER_FOLD = 8;
const N = 120, M = 5;

// Baseline = greedy by value / sum_j(w_j / cap_j), take if it fits. Also the starter.
function solve(items, caps) {
  const m = caps.length;
  const eff = items.map((it, i) => {
    let w = 0;
    for (let j = 0; j < m; j++) w += it.w[j] / caps[j];
    return [it.v / (w || 1e-9), i];
  });
  eff.sort((a, b) => b[0] - a[0] || a[1] - b[1]);
  const used = new Array(m).fill(0), picked = [];
  for (const [, i] of eff) {
    const w = items[i].w;
    let fits = true;
    for (let j = 0; j < m; j++) if (used[j] + w[j] > caps[j]) { fits = false; break; }
    if (!fits) continue;
    for (let j = 0; j < m; j++) used[j] += w[j];
    picked.push(i);
  }
  return picked;
}

export const meta = {
  id: 'knapsack',
  title: '多维背包',
  entry: 'solve',
  signature: 'solve(items: { v: number, w: number[] }[], caps: number[]) → number[]  // indices of chosen items',
  metric: '贪心基线价值 ÷ 总价值',
  direction: 'max',
  timeLimitMs: 1000,
  budgetHintMs: 250,
  spec: [
    'Task: multi-dimensional 0/1 knapsack with 5 capacity constraints (n ≈ 120 items), so pseudo-polynomial DP is infeasible.',
    'Define a top-level function `solve(items, caps)`:',
    '- `items`: array of { v, w } where v is a positive integer value and w is an array of 5 non-negative integer weights.',
    '- `caps`: array of 5 positive integer capacities.',
    '- Return an array of DISTINCT item indices (integers in 0..items.length-1) such that for every dimension j, the sum of w[j] over chosen items <= caps[j].',
    'Violating a capacity, duplicate/invalid indices, or an empty/zero-value selection fails the whole evaluation.',
    'Objective: MAXIMISE total value. Score = geometric mean over instances of value(greedy baseline) / value; lower is better, 1.0 = baseline (greedy by v / Σ_j w_j/cap_j).',
    'Pure JavaScript, no imports, no I/O, no eval/new Function. Math.random is seeded (deterministic). Aim for at most 250 ms per instance (hard cap 1000 ms; exceeding it fails the evaluation). Prefer iteration-count limits over wall-clock checks.',
  ].join('\n'),
};

export const starter = solve.toString() + '\n';

const cache = {};
export function instances(fold) {
  if (!cache[fold]) {
    cache[fold] = Array.from({ length: PER_FOLD }, (_, i) => {
      const r = mulberry32(instanceSeed('knapsack', fold, i));
      const correlated = i % 2 === 1;
      const items = [];
      for (let k = 0; k < N; k++) {
        const w = Array.from({ length: M }, () => randInt(r, 1, 100));
        const avg = w.reduce((a, b) => a + b, 0) / M;
        const v = correlated ? Math.max(1, Math.round(avg + randInt(r, 0, 40))) : randInt(r, 1, 100);
        items.push({ v, w });
      }
      const tight = uniform(r, 0.25, 0.5);
      const caps = Array.from({ length: M }, (_, j) => Math.max(1, Math.floor(tight * items.reduce((a, it) => a + it.w[j], 0))));
      return { items, caps };
    });
  }
  return cache[fold];
}

export function verify(inst, output) {
  const { items, caps } = inst;
  if (!Array.isArray(output)) return { ok: false, error: 'expected an array of indices' };
  const seen = new Set(), used = new Array(caps.length).fill(0);
  let value = 0;
  for (const i of output) {
    if (!Number.isInteger(i) || i < 0 || i >= items.length) return { ok: false, error: `invalid index ${String(i).slice(0, 20)}` };
    if (seen.has(i)) return { ok: false, error: `index ${i} chosen twice` };
    seen.add(i); value += items[i].v;
    for (let j = 0; j < caps.length; j++) used[j] += items[i].w[j];
  }
  for (let j = 0; j < caps.length; j++) if (used[j] > caps[j]) return { ok: false, error: `capacity ${j} exceeded: ${used[j]} > ${caps[j]}` };
  if (value <= 0) return { ok: false, error: 'total value is 0' };
  return { ok: true, cost: value };
}

export function baseline(inst) {
  let v = 0;
  for (const i of solve(inst.items, inst.caps)) v += inst.items[i].v;
  return v;
}

/** Arguments passed to solve(), in order. */
export const args = (inst) => [inst.items, inst.caps];
