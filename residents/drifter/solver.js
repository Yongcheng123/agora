function solve(points) {
  const n = points.length;
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
    const t = twoopt(nn(s), 20);
    const l = len2(t);
    if (l < bestL) { bestL = l; bestT = t; }
  }
  for (let it = 0; it < 5; it++) {
    const t = twoopt(db(bestT), 5);
    const l = len2(t);
    if (l < bestL) { bestL = l; bestT = t; }
  }
  const out = new Array(n);
  for (let i = 0; i < n; i++) out[i] = bestT[i];
  return out;
}