function solve(points) {
  const n = points.length;
  if (n < 4) { const o = new Array(n); for (let i = 0; i < n; i++) o[i] = i; return o; }
  const X = new Float64Array(n), Y = new Float64Array(n);
  for (let i = 0; i < n; i++) { X[i] = points[i][0]; Y[i] = points[i][1]; }
  const D = new Float64Array(n * n);
  for (let i = 0; i < n; i++) {
    const xi = X[i], yi = Y[i];
    for (let j = i + 1; j < n; j++) {
      const dx = xi - X[j], dy = yi - Y[j];
      const d = Math.sqrt(dx * dx + dy * dy);
      D[i * n + j] = d; D[j * n + i] = d;
    }
  }
  const tourLen = (t) => {
    let s = 0;
    for (let i = 0; i < n; i++) {
      const ni = i + 1 < n ? i + 1 : 0;
      s += D[t[i] * n + t[ni]];
    }
    return s;
  };
  let stat2 = 0, statOr = 0;
  const nn = (start) => {
    const used = new Uint8Array(n);
    const t = new Int32Array(n);
    t[0] = start; used[start] = 1;
    let cur = start;
    for (let k = 1; k < n; k++) {
      let best = -1, bd = Infinity;
      const row = cur * n;
      for (let j = 0; j < n; j++) {
        if (used[j]) continue;
        const d = D[row + j];
        if (d < bd) { bd = d; best = j; }
      }
      t[k] = best; used[best] = 1; cur = best;
    }
    return t;
  };
  // 2-opt: same float expression tree as G40, only row offsets hoisted + doubled tour array
  const twoopt = (t0, maxPass) => {
    const t = new Int32Array(t0);
    const dlb = new Uint8Array(n);
    const TT = new Int32Array(2 * n);
    let improved = true, pass = 0;
    while (improved && pass < maxPass) {
      improved = false; pass++; stat2++;
      for (let i = 0; i < n; i++) TT[i] = t[i];
      for (let i = 0; i < n; i++) TT[i + n] = TT[i];
      for (let i = 0; i < n - 1; i++) {
        if (dlb[i]) continue;
        const a = t[i], b = t[i + 1];
        const an = a * n, bn = b * n;
        const dab = D[an + b];
        let bestK = -1, bestGain = 0;
        for (let k = i + 2; k < n; k++) {
          const c = TT[k], d = TT[k + 1];
          const cn = c * n;
          const g = D[an + c] + D[bn + d] - dab - D[cn + d];
          if (g < bestGain - 1e-9) { bestGain = g; bestK = k; }
        }
        if (bestK !== -1) {
          let lo = i + 1, hi = bestK;
          while (lo < hi) { const tmp = t[lo]; t[lo] = t[hi]; t[hi] = tmp; lo++; hi--; }
          for (let x = i + 1; x <= bestK; x++) TT[x] = t[x];
          for (let x = i + 1; x <= bestK; x++) TT[x + n] = TT[x];
          const lo2 = i > 0 ? i - 1 : 0;
          const hi2 = bestK + 1 < n ? bestK + 1 : n - 1;
          for (let x = lo2; x <= hi2; x++) dlb[x] = 0;
          improved = true;
        } else {
          dlb[i] = 1;
        }
      }
    }
    return t;
  };
  // or-opt (segment insertion, forward or reversed): same float expression tree as G40
  const orOpt = (t0, maxL, maxPass) => {
    const t = new Int32Array(t0);
    if (n < 4) return t;
    if (maxL > n - 2) maxL = n - 2;
    const T2 = new Int32Array(2 * n);
    const sync = () => { for (let k = 0; k < n; k++) { const v = t[k]; T2[k] = v; T2[k + n] = v; } };
    for (let pass = 0; pass < maxPass; pass++) {
      statOr++;
      let improved = false;
      sync();
      for (let L = 1; L <= maxL; L++) {
        for (let i = 0; i < n; i++) {
          const a = t[i];
          const an = a * n;
          const head = T2[i + 1];
          const tail = T2[i + L];
          const tn = tail * n;
          const hn = head * n;
          const d = T2[i + L + 1];
          const remLoss = D[an + head] + D[tn + d] - D[an + d];
          let bestGain = 1e-9, bestJ = -1, bestRev = 0;
          for (let j = 0; j < n; j++) {
            let off = j - i; if (off < 0) off += n;
            if (off <= L) continue;
            const p = t[j];
            const pn = p * n;
            const q = T2[j + 1];
            const base = D[pn + q];
            const insNorm = D[pn + head] + D[tn + q] - base;
            const g = remLoss - insNorm;
            if (g > bestGain) { bestGain = g; bestJ = j; bestRev = 0; }
            if (L >= 2) {
              const insRev = D[pn + tail] + D[hn + q] - base;
              const gr = remLoss - insRev;
              if (gr > bestGain) { bestGain = gr; bestJ = j; bestRev = 1; }
            }
          }
          if (bestJ !== -1) {
            const ws = i + L + 1;
            let m = bestJ - ws; if (m < 0) m += n;
            const newT = new Int32Array(n);
            for (let k = 0; k <= m; k++) newT[k] = T2[ws + k];
            for (let k = 0; k < L; k++) newT[m + 1 + k] = bestRev ? T2[i + L - k] : T2[i + 1 + k];
            for (let k = 0; k < n - m - L - 1; k++) newT[m + 1 + L + k] = T2[ws + m + 1 + k];
            for (let k = 0; k < n; k++) t[k] = newT[k];
            sync();
            improved = true;
          }
        }
      }
      if (!improved) break;
    }
    return t;
  };
  // double bridge, verbatim RNG draw order
  const db = (t0) => {
    if (n < 8) return new Int32Array(t0);
    const p1 = 1 + ((Math.random() * (n - 3)) | 0);
    const p2 = p1 + 1 + ((Math.random() * (n - p1 - 2)) | 0);
    const p3 = p2 + 1 + ((Math.random() * (n - p2 - 1)) | 0);
    const r = new Int32Array(n);
    let idx = 0;
    for (let i = 0; i <= p1; i++) r[idx++] = t0[i];
    const pat = (Math.random() * 5) | 0;
    if (pat === 0) {
      for (let i = p2 + 1; i <= p3; i++) r[idx++] = t0[i];
      for (let i = p1 + 1; i <= p2; i++) r[idx++] = t0[i];
      for (let i = p3 + 1; i < n; i++) r[idx++] = t0[i];
    } else if (pat === 1) {
      for (let i = p3 + 1; i < n; i++) r[idx++] = t0[i];
      for (let i = p2 + 1; i <= p3; i++) r[idx++] = t0[i];
      for (let i = p1 + 1; i <= p2; i++) r[idx++] = t0[i];
    } else if (pat === 2) {
      for (let i = p3 + 1; i < n; i++) r[idx++] = t0[i];
      for (let i = p1 + 1; i <= p2; i++) r[idx++] = t0[i];
      for (let i = p2 + 1; i <= p3; i++) r[idx++] = t0[i];
    } else if (pat === 3) {
      for (let i = p1 + 1; i <= p2; i++) r[idx++] = t0[i];
      for (let i = p3 + 1; i < n; i++) r[idx++] = t0[i];
      for (let i = p2 + 1; i <= p3; i++) r[idx++] = t0[i];
    } else {
      for (let i = p2 + 1; i <= p3; i++) r[idx++] = t0[i];
      for (let i = p3 + 1; i < n; i++) r[idx++] = t0[i];
      for (let i = p1 + 1; i <= p2; i++) r[idx++] = t0[i];
    }
    return r;
  };
  let far = 0, farD = 0;
  for (let j = 1; j < n; j++) { const d = D[j]; if (d > farD) { farD = d; far = j; } }
  let fps3 = -1, fps3Score = -1;
  for (let i = 0; i < n; i++) {
    if (i === 0 || i === far) continue;
    const minD = D[i] < D[far * n + i] ? D[i] : D[far * n + i];
    if (minD > fps3Score) { fps3Score = minD; fps3 = i; }
  }
  let bestT = null, bestL = Infinity;
  const starts = [0, far, fps3];
  for (let si = 0; si < 3; si++) {
    const s = starts[si];
    let t = nn(s);
    t = twoopt(t, 20);
    t = orOpt(t, 3, 3);
    const l = tourLen(t);
    if (l < bestL) { bestL = l; bestT = t; }
  }
  if (bestT === null) { bestT = nn(0); bestL = tourLen(bestT); }
  bestT = orOpt(bestT, 5, 2);
  bestL = tourLen(bestT);
  const E2P = n * (n - 2) / 2;
  const EORP = n * n * 3;
  const ILS_BUDGET = 200000 * n * n;
  const clock = (typeof Date !== 'undefined' && typeof Date.now === 'function') ? Date.now : null;
  // One ILS phase. dev schedule is a pure function of the kick counter, so a longer
  // phase is a strict prefix-extension of a shorter one => best is weakly monotone.
  const runPhase = (startCur, startBest, startBestL, msLimit, devHi, devLo, sched) => {
    let bestTour = startBest, bL = startBestL, cur = startCur;
    const logr = Math.log(devLo / devHi);
    let used = 0, guard = 0, reason = 'guard';
    const t0 = clock ? clock() : 0;
    while (used < ILS_BUDGET && guard < 200000) {
      if (clock && (guard & 7) === 7 && clock() - t0 > msLimit) { reason = 'time'; break; }
      guard++;
      const a2 = stat2, ao = statOr;
      let t = db(cur);
      t = twoopt(t, 5);
      t = orOpt(t, 2, 1);
      const l = tourLen(t);
      let prog = guard / sched; if (prog > 1) prog = 1;
      const dev = devHi * Math.exp(logr * prog);
      if (l < bL) { bL = l; bestTour = t; cur = t; }
      else if (l < bL * (1 + dev)) { cur = (l > bL * (1 + 4 * dev)) ? bestTour : t; }
      used += (stat2 - a2) * E2P + (statOr - ao) * EORP;
    }
    if (reason !== 'time' && used >= ILS_BUDGET) reason = 'budget';
    return { bestTour: bestTour, bestL: bL, kicks: guard, reason: reason };
  };
  // Phase 1: G40's chain, verbatim behaviour, longer wall clock / no accounting cap.
  // Phase 2: reheat from the global best; the global best is kept across phases so
  // this can only improve (protected exploration).
  const p1 = runPhase(bestT, bestT, bestL, 430, 0.015, 0.001, 160);
  const p2 = runPhase(p1.bestTour, p1.bestTour, p1.bestL, 45, 0.010, 0.001, 60);
  // strictly improving polish (2-opt / or-opt only ever apply improving moves)
  let pol = p2.bestTour;
  for (let round = 0; round < 6; round++) {
    const before = tourLen(pol);
    pol = twoopt(pol, 60);
    pol = orOpt(pol, 3, 10);
    const after = tourLen(pol);
    if (after > before - 1e-9) break;
  }
  const LMAX = n - 2 < 30 ? n - 2 : 30;
  pol = orOpt(pol, LMAX, 2);
  pol = twoopt(pol, 60);
  pol = orOpt(pol, 4, 8);
  pol = twoopt(pol, 60);
  let finalL = tourLen(pol);
  if (finalL > p2.bestL) { pol = p2.bestTour; finalL = p2.bestL; }
  const out = new Array(n);
  for (let i = 0; i < n; i++) out[i] = pol[i];
  const seen = new Uint8Array(n);
  let ok = true;
  for (let i = 0; i < n; i++) {
    const v = out[i];
    if (!(v >= 0 && v < n) || v % 1 !== 0 || seen[v]) { ok = false; break; }
    seen[v] = 1;
  }
  if (!ok) { const t = nn(0); for (let i = 0; i < n; i++) out[i] = t[i]; }
  try {
    if (typeof globalThis !== 'undefined') globalThis.__g52 = { k1: p1.kicks, k2: p2.kicks, r1: p1.reason, r2: p2.reason, l1: p1.bestL, l2: p2.bestL, lf: finalL };
  } catch (e) {}
  return out;
}
