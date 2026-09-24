// tasks/rng.mjs — deterministic randomness for instance generation. PROTECTED.
// Everything here is pure: same seed → same numbers, on every machine.

/** mulberry32: tiny 32-bit PRNG, returns floats in [0, 1). */
export function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** FNV-1a hash of a string → uint32, for deriving seeds from names. */
export function hashSeed(str) {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 0x01000193); }
  return h >>> 0;
}

/** Seed for instance `index` of `fold` of `taskId`. */
export function instanceSeed(taskId, fold, index) {
  return hashSeed(`agora/${taskId}/${fold}/${index}`);
}

export const uniform = (r, lo, hi) => lo + (hi - lo) * r();
export const randInt = (r, lo, hi) => lo + Math.floor(r() * (hi - lo + 1)); // inclusive
export function normal(r) { // Box–Muller
  let u = r(); if (u < 1e-12) u = 1e-12;
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * r());
}
/** Round to a fixed number of decimals so instances are exact in JSON. */
export const round = (x, d = 4) => Math.round(x * 10 ** d) / 10 ** d;

/** Geometric mean of positive numbers. */
export function geomean(xs) {
  let s = 0;
  for (const x of xs) s += Math.log(x);
  return Math.exp(s / xs.length);
}

export const FOLDS = ['train', 'holdout'];
