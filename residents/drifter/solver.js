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
      const d = dx * dx + dy * dy;
      d2[i * n + j] = d; d2[j * n + i] = d;
    }
  }
  const len2 = (t) => {
    let s = 0;
    for (let i = 0; i < n; i++) {
      const ni = i + 1 < n ? i + 1 : 0;
      s += d2[t[i] * n + t[ni]];
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
        const d = d2[row + j];
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
      improved = false; pass++; stat2++;
      for (let i = 0; i < n - 1; i++) {
        if (dlb[i]) continue;
        const a = t[i], b = t[i + 1];
        const dab = d2[a * n + b];
        let bestK = -1, bestGain = 0;
        for (let k = i + 2; k < n; k++) {
          const c = t[k];
          const d = (k + 1 < n) ? t[k + 1] : t[0];
          const g = d2[a * n + c] + d2[b * n + d] - dab - d2[c * n + d];
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
  // MODIFIED: duplicated tour array T2 = t ++ t removes every % from the inner loop
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
          const head = T2[i + 1];
          const tail = T2[i + L];
          const d = T2[i + L + 1];
          const remLoss = d2[a * n + head] + d2[tail * n + d] - d2[a * n + d];
          let bestGain = 1e-9, bestJ = -1, bestRev = 0;
          for (let j = 0; j < n; j++) {
            let off = j - i; if (off < 0) off += n;
            if (off <= L) continue;
            const p = t[j];
            const q = T2[j + 1];
            const base = d2[p * n + q];
            const insNorm = d2[p * n + head] + d2[tail * n + q] - base;
            const g = remLoss - insNorm;
            if (g > bestGain) { bestGain = g; bestJ = j; bestRev = 0; }
            if (L >= 2) {
              const insRev = d2[p * n + tail] + d2[head * n + q] - base;
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
  const db = (t0) => {
    if (n < 8) return new Int32Array(t0);
    const p1 = 1 + ((Math.random() * (n - 3)) | 0);
    const p2 = p1 + 1 + ((Math.random() * (n - p1 - 2)) | 0);
    const p3 = p2 + 1 + ((Math.random() * (n - p2 - 1)) | 0);
    const r = new Int32Array(n);
    let idx = 0;
    for (let i = 0; i <= p1; i++) r[idx++] = t0[i];
    const pat = (Math.random() * 3) | 0;
    if (pat === 0) {
      for (let i = p2 + 1; i <= p3; i++) r[idx++] = t0[i];
      for (let i = p1 + 1; i <= p2; i++) r[idx++] = t0[i];
      for (let i = p3 + 1; i < n; i++) r[idx++] = t0[i];
    } else if (pat === 1) {
      for (let i = p3 + 1; i < n; i++) r[idx++] = t0[i];
      for (let i = p2 + 1; i <= p3; i++) r[idx++] = t0[i];
      for (let i = p1 + 1; i <= p2; i++) r[idx++] = t0[i];
    } else {
      for (let i = p3 + 1; i < n; i++) r[idx++] = t0[i];
      for (let i = p1 + 1; i <= p2; i++) r[idx++] = t0[i];
      for (let i = p2 + 1; i <= p3; i++) r[idx++] = t0[i];
    }
    return r;
  };
  let far = 0, farD = 0;
  for (let j = 1; j < n; j++) {
    const d = d2[j];
    if (d > farD) { farD = d; far = j; }
  }
  let fps3 = -1, fps3Score = -1;
  for (let i = 0; i < n; i++) {
    if (i === 0 || i === far) continue;
    const minD = d2[i] < d2[far * n + i] ? d2[i] : d2[far * n + i];
    if (minD > fps3Score) { fps3Score = minD; fps3 = i; }
  }
  let bestT, bestL = Infinity;
  for (const s of [0, far, fps3]) {
    let t = nn(s);
    t = twoopt(t, 20);
    t = orOpt(t, 3, 3);
    const l = len2(t);
    if (l < bestL) { bestL = l; bestT = t; }
  }
  bestT = orOpt(bestT, 5, 2);
  bestL = len2(bestT);
  // MODIFIED: budget 140*n^2 -> 2000*n^2, wall-clock safety valve, annealed deviation
  const DEV_HI = 0.015, DEV_LO = 0.001;
  const E2P = n * (n - 2) / 2;
  const EORP = n * n * 3;
  const ILS_BUDGET = 2000 * n * n;
  const SCHED = 160;
  const clock = (typeof Date !== 'undefined' && typeof Date.now === 'function') ? Date.now : null;
  const tStart = clock ? clock() : 0;
  const logr = Math.log(DEV_LO / DEV_HI);
  let bestTour = bestT;
  let cur = bestT;
  let used = 0, guard = 0;
  while (used < ILS_BUDGET && guard < 4000) {
    if (clock && (guard & 7) === 7 && clock() - tStart > 240) break;
    guard++;
    const a2 = stat2, ao = statOr;
    let t = db(cur);
    t = twoopt(t, 5);
    t = orOpt(t, 2, 1);
    const l = len2(t);
    let prog = guard / SCHED; if (prog > 1) prog = 1;
    const dev = DEV_HI * Math.exp(logr * prog);
    if (l < bestL) { bestL = l; bestTour = t; cur = t; }
    else if (l < bestL * (1 + dev)) { cur = (l > bestL * (1 + 4 * dev)) ? bestTour : t; }
    used += (stat2 - a2) * E2P + (statOr - ao) * EORP;
  }
  bestTour = orOpt(bestTour, 3, 4);
  bestTour = orOpt(bestTour, 8, 2);
  const out = new Array(n);
  for (let i = 0; i < n; i++) out[i] = bestTour[i];
  return out;
}