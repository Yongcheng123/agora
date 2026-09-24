// tasks/binpack.mjs — ONLINE bin packing, capacity 1.0. PROTECTED.
// The solver sees one item at a time: place(size, bins) with `bins` = remaining capacities of the
// open bins. Future items never leave the host (see engine/evaluate.mjs).
import { mulberry32, instanceSeed, uniform, round } from './rng.mjs';

export const EPS = 1e-9;
const N_ITEMS = 500;
const PER_FOLD = 8;

// Baseline = First Fit. Its source is also the starter, so the starter scores exactly 1.0.
function place(size, bins) {
  for (let i = 0; i < bins.length; i++) if (bins[i] >= size - 1e-9) return i;
  return -1;
}

export const meta = {
  id: 'binpack',
  title: '在线装箱',
  entry: 'place',
  online: true,
  signature: 'place(size: number, bins: number[]) → number  // index of a bin that fits, or -1 to open a new bin',
  metric: '箱子数 ÷ First Fit 基线',
  direction: 'min',
  timeLimitMs: 1000,
  budgetHintMs: 100,
  spec: [
    'Task: ONLINE bin packing. Bin capacity is 1.0. Items arrive one at a time; each must be placed immediately and permanently.',
    'Define a top-level function `place(size, bins)`:',
    '- `size`: number in (0, 1], the current item (rounded to 4 decimals).',
    '- `bins`: array of numbers, the REMAINING capacity of every open bin, in the order the bins were opened (a fresh copy each call; mutating it has no effect).',
    '- Return an integer index i (0 <= i < bins.length) with bins[i] >= size - 1e-9 to put the item there, or -1 to open a new bin (which gets remaining capacity 1 - size and is appended at the end).',
    'Any other return value (non-integer, out of range, bin too full) fails the whole evaluation.',
    'You never see future items. Each instance has about 500 items; instances mix distributions (uniform sizes, bimodal small/large, many small items).',
    'Top-level state is allowed and persists across calls within one instance AND across instances; bins.length === 0 marks the first item of a new instance.',
    'Objective: minimise the number of bins used. Score = geometric mean over instances of bins / bins(First Fit); lower is better, 1.0 = First Fit.',
    `Pure JavaScript, no imports, no I/O, no eval/new Function. Math.random is seeded (deterministic). Aim for at most ${100} ms per instance in total (the hard cap is 1000 ms per instance).`,
  ].join('\n'),
};

export const starter = place.toString() + '\n';

function genSizes(r, kind) {
  const out = [];
  for (let i = 0; i < N_ITEMS; i++) {
    let s;
    if (kind === 'uniform') s = uniform(r, 0.02, 0.7);
    else if (kind === 'bimodal') s = r() < 0.5 ? uniform(r, 0.08, 0.3) : uniform(r, 0.45, 0.75);
    else if (kind === 'small') s = r() < 0.85 ? uniform(r, 0.01, 0.2) : uniform(r, 0.3, 0.9);
    else s = uniform(r, 0.25, 0.5); // 'thirds': awkward mid-sized items
    out.push(Math.min(1, Math.max(0.0001, round(s, 4))));
  }
  return out;
}

const KINDS = ['uniform', 'bimodal', 'small', 'thirds'];
const cache = {};
export function instances(fold) {
  if (!cache[fold]) {
    cache[fold] = Array.from({ length: PER_FOLD }, (_, i) => {
      const r = mulberry32(instanceSeed('binpack', fold, i));
      const kind = KINDS[i % KINDS.length];
      return { kind, items: genSizes(r, kind) };
    });
  }
  return cache[fold];
}

/** Items as a stream — host-side only. */
export const stream = (inst) => inst.items;

/** Replay a decision list; `output` = array of indices (one per item). */
export function verify(inst, output) {
  if (!Array.isArray(output) || output.length !== inst.items.length) return { ok: false, error: 'expected one decision per item' };
  const bins = [];
  for (let k = 0; k < inst.items.length; k++) {
    const e = check(inst.items[k], bins, output[k]);
    if (e) return { ok: false, error: `item ${k}: ${e}` };
    apply(inst.items[k], bins, output[k]);
  }
  return { ok: true, cost: bins.length };
}

/** Validate a single decision against the current bins; returns an error string or null. */
export function check(size, bins, d) {
  if (typeof d !== 'number' || !Number.isInteger(d)) return 'decision is not an integer';
  if (d === -1) return null;
  if (d < 0 || d >= bins.length) return `bin index ${d} out of range`;
  if (!(bins[d] >= size - EPS)) return `bin ${d} has ${bins[d]} left, item is ${size}`;
  return null;
}
export function apply(size, bins, d) {
  if (d === -1) bins.push(1 - size); else bins[d] -= size;
}

export function baseline(inst) {
  const bins = [];
  for (const s of inst.items) apply(s, bins, place(s, bins.slice()));
  return bins.length;
}
