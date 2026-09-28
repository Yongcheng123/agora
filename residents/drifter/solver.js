function solve(points) {
  const n = points.length;
  if (n < 4) { const o = new Array(n); for (let i = 0; i < n; i++) o[i] = i; return o; }
  const X = new Float64Array(n), Y = new Float64Array(n);
  for (let i = 0; i < n; i++) { X[i] = points[i][0]; Y[i] = points[i][1]; }
  const d2 = new Float64Array(n * n);
  for (let i = 0; i < n; i++) {
    const xi = X[i], yi = Y[i];
    for (let j = i + 1; j < n; j++) {
      const dx = xi - X[j], dy = yi - Y[j];
      const d = dx*dx + dy*dy;
      d2[i*n+j] = d; d2[j*n+i] = d;
    }
  }
  const len2 = (t) => {
    let s = 0;
    for (let i = 0; i < n; i++) {
      const ni = i + 1 < n ? i + 1 : 0;
      s += d2[t[i]*n + t[ni]];
    }
    return s;
  };
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
        const d = d2[row+j];
        if (d < bd) { bd = d; best = j; }
      }
      t[k] = best; used[best] = 1; cur = best;
    }
    return t;
  };
  const twoopt = (t0, maxPass) => {
    const t = new Int32Array(t0);
    const dlb = new Uint8Array(n);
    let improved = true; let pass = 0;
    while (improved && pass < maxPass) {
      improved = false; pass++;
      for (let i = 0; i < n - 1; i++) {
        if (dlb[i]) continue;
        const a = t[i], b = t[i + 1];
        const dab = d2[a*n + b];
        let bestK = -1, bestGain = 0;
        for (let k = i + 2; k < n; k++) {
          const c = t[k];
          const d = (k + 1 < n) ? t[k + 1] : t[0];
          const g = d2[a*n + c] + d2[b*n + d] - dab - d2[c*n + d];
          if (g < bestGain - 1e-9) { bestGain = g; bestK = k; }
        }
        if (bestK !== -1) {
          let lo = i + 1, hi = bestK;
          while (lo < hi) { const tmp = t[lo]; t[lo] = t[hi]; t[hi] = tmp; lo++; hi--; }
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
  // Generalized or-opt for circular tours: relocate segment [i+1..i+L] of length 1..maxL
  // to any insertion site. For L >= 2 also tries segment reversal before insertion,
  // covering some 3-opt restricted moves without a full 3-opt implementation.
  // Full array rebuild is used (cheaper than handling all wrap cases for L > 1 inline).
  const orOpt = (t0, maxL, maxPass) => {
    const t = new Int32Array(t0);
    if (n < 4) return t;
    for (let pass = 0; pass < maxPass; pass++) {
      let improved = false;
      for (let L = 1; L <= maxL; L++) {
        for (let i = 0; i < n; i++) {
          const a = t[i];
          const head = t[(i + 1) % n];
          const tail = t[(i + L) % n];
          const d = t[(i + L + 1) % n];
          const remLoss = d2[a*n + head] + d2[tail*n + d] - d2[a*n + d];
          let bestGain = 1e-9, bestJ = -1, bestRev = 0;
          for (let j = 0; j < n; j++) {
            const off = ((j - i) % n + n) % n;
            if (off <= L) continue;
            const p = t[j];
            const q = t[(j + 1) % n];
            const insNorm = d2[p*n + head] + d2[tail*n + q] - d2[p*n + q];
            const gain = remLoss - insNorm;
            if (gain > bestGain) { bestGain = gain; bestJ = j; bestRev = 0; }
            if (L >= 2) {
              const insRev = d2[p*n + tail] + d2[head*n + q] - d2[p*n + q];
              const gr = remLoss - insRev;
              if (gr > bestGain) { bestGain = gr; bestJ = j; bestRev = 1; }
            }
          }
          if (bestJ !== -1) {
            const walkStart = (i + L + 1) % n;
            let insPos = 0;
            for (let k = 0; k < n - L; k++) {
              if (((walkStart + k) % n) === bestJ) { insPos = k; break; }
            }
            const newT = new Int32Array(n);
            for (let k = 0; k <= insPos; k++) newT[k] = t[(walkStart + k) % n];
            for (let k = 0; k < L; k++) {
              const srcIdx = bestRev ? (L - 1 - k) : k;
              newT[insPos + 1 + k] = t[(i + 1 + srcIdx) % n];
            }
            for (let k = insPos + 1; k < n - L; k++) newT[L + k] = t[(walkStart + k) % n];
            for (let k = 0; k < n; k++) t[k] = newT[k];
            improved = true;
          }
        }
      }
      if (!improved) break;
    }
    return t;
  };
  const db = (t) => {
    if (n < 8) return new Int32Array(t);
    const p1 = 1 + ((Math.random() * (n - 3)) | 0);
    const p2 = p1 + 1 + ((Math.random() * (n - p1 - 2)) | 0);
    const p3 = p2 + 1 + ((Math.random() * (n - p2 - 1)) | 0);
    const r = new Int32Array(n);
    let idx = 0;
    for (let i = 0; i <= p1; i++) r[idx++] = t[i];
    for (let i = p2 + 1; i <= p3; i++) r[idx++] = t[i];
    for (let i = p1 + 1; i <= p2; i++) r[idx++] = t[i];
    for (let i = p3 + 1; i < n; i++) r[idx++] = t[i];
    return r;
  };
  let far = 0, farD = 0;
  for (let j = 1; j < n; j++) {
    const d = d2[j];
    if (d > farD) { farD = d; far = j; }
  }
  let bestT, bestL = Infinity;
  for (const s of [0, far]) {
    let t = nn(s);
    t = twoopt(t, 20);
    t = orOpt(t, 3, 3);
    const l = len2(t);
    if (l < bestL) { bestL = l; bestT = t; }
  }
  bestT = orOpt(bestT, 5, 2);
  bestL = len2(bestT);
  for (let it = 0; it < 8; it++) {
    let t = db(bestT);
    t = twoopt(t, 5);
    t = orOpt(t, 2, 1);
    const l = len2(t);
    if (l < bestL) { bestL = l; bestT = t; }
  }
  bestT = orOpt(bestT, 3, 4);
  bestT = orOpt(bestT, 5, 2);
  bestL = len2(bestT);
  const out = new Array(n);
  for (let i = 0; i < n; i++) out[i] = bestT[i];
  return out;
}