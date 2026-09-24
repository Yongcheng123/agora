// tasks/tsp.mjs — Euclidean TSP. PROTECTED.
import { mulberry32, instanceSeed, uniform, normal, randInt, round } from './rng.mjs';

const PER_FOLD = 8;

// Baseline = nearest neighbour from city 0. Its source is also the starter.
function solve(points) {
  const n = points.length, used = new Array(n).fill(false), tour = [0];
  used[0] = true;
  let cur = 0;
  for (let k = 1; k < n; k++) {
    let best = -1, bd = Infinity;
    for (let j = 0; j < n; j++) {
      if (used[j]) continue;
      const dx = points[cur][0] - points[j][0], dy = points[cur][1] - points[j][1], d = dx * dx + dy * dy;
      if (d < bd) { bd = d; best = j; }
    }
    used[best] = true; tour.push(best); cur = best;
  }
  return tour;
}

export const meta = {
  id: 'tsp',
  title: '欧氏 TSP',
  entry: 'solve',
  signature: 'solve(points: [x, y][]) → number[]  // a permutation of 0..n-1',
  metric: '路径长度 ÷ 最近邻基线',
  direction: 'min',
  timeLimitMs: 1000,
  budgetHintMs: 250,
  spec: [
    'Task: symmetric Euclidean travelling salesman.',
    'Define a top-level function `solve(points)`:',
    '- `points`: array of n [x, y] pairs (numbers in [0, 1000], n ≈ 200; some instances uniform, some clustered).',
    '- Return an array that is a permutation of 0..n-1 (the visiting order). The tour is closed: it returns from the last city to the first.',
    'Anything else (wrong length, duplicates, non-integers) fails the whole evaluation.',
    'Objective: minimise total Euclidean tour length. Score = geometric mean over instances of length / length(nearest neighbour from city 0); lower is better, 1.0 = baseline.',
    'Pure JavaScript, no imports, no I/O, no eval/new Function. Math.random is seeded (deterministic). Aim for at most 250 ms per instance (hard cap 1000 ms; exceeding it fails the evaluation). Prefer iteration-count limits over wall-clock checks.',
  ].join('\n'),
};

export const starter = solve.toString() + '\n';

const cache = {};
export function instances(fold) {
  if (!cache[fold]) {
    cache[fold] = Array.from({ length: PER_FOLD }, (_, i) => {
      const r = mulberry32(instanceSeed('tsp', fold, i));
      const n = randInt(r, 180, 220);
      const clustered = i % 2 === 1;
      const centers = clustered ? Array.from({ length: randInt(r, 4, 10) }, () => [uniform(r, 100, 900), uniform(r, 100, 900)]) : null;
      const points = [];
      for (let k = 0; k < n; k++) {
        let x, y;
        if (clustered) {
          const c = centers[Math.floor(r() * centers.length)], sd = 30 + 40 * r();
          x = c[0] + sd * normal(r); y = c[1] + sd * normal(r);
        } else { x = uniform(r, 0, 1000); y = uniform(r, 0, 1000); }
        points.push([round(Math.min(1000, Math.max(0, x)), 2), round(Math.min(1000, Math.max(0, y)), 2)]);
      }
      return { points };
    });
  }
  return cache[fold];
}

export function tourLength(points, tour) {
  let s = 0;
  for (let i = 0; i < tour.length; i++) {
    const a = points[tour[i]], b = points[tour[(i + 1) % tour.length]];
    s += Math.hypot(a[0] - b[0], a[1] - b[1]);
  }
  return s;
}

export function verify(inst, output) {
  const n = inst.points.length;
  if (!Array.isArray(output) || output.length !== n) return { ok: false, error: `expected a permutation of length ${n}` };
  const seen = new Uint8Array(n);
  for (const v of output) {
    if (!Number.isInteger(v) || v < 0 || v >= n) return { ok: false, error: `invalid city ${String(v).slice(0, 20)}` };
    if (seen[v]) return { ok: false, error: `city ${v} visited twice` };
    seen[v] = 1;
  }
  return { ok: true, cost: tourLength(inst.points, output) };
}

export function baseline(inst) { return tourLength(inst.points, solve(inst.points)); }

/** Arguments passed to solve(), in order. */
export const args = (inst) => [inst.points];
