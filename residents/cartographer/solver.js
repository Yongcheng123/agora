function solve(points) {
  const n = points.length;
  if (n <= 1) {
    const t = new Array(n);
    for (let i = 0; i < n; i++) t[i] = i;
    return t;
  }
  if (n === 2) return [0, 1];
  if (n === 3) return [0, 1, 2];

  // ---- true Euclidean distance matrix ----
  const D = new Float64Array(n * n);
  for (let i = 0; i < n; i++) {
    const xi = points[i][0], yi = points[i][1];
    const ro = i * n;
    for (let j = i + 1; j < n; j++) {
      const dx = xi - points[j][0];
      const dy = yi - points[j][1];
      const d = Math.sqrt(dx * dx + dy * dy);
      D[ro + j] = d;
      D[j * n + i] = d;
    }
  }

  // ---- K nearest neighbours per city ----
  const K = Math.min(12, n - 1);
  const NB = new Int32Array(n * K);
  {
    const bd = new Float64Array(K);
    const bi = new Int32Array(K);
    for (let i = 0; i < n; i++) {
      let m = 0;
      const ro = i * n;
      for (let j = 0; j < n; j++) {
        if (j === i) continue;
        const d = D[ro + j];
        if (m < K) {
          let p = m; m++;
          while (p > 0 && bd[p - 1] > d) { bd[p] = bd[p - 1]; bi[p] = bi[p - 1]; p--; }
          bd[p] = d; bi[p] = j;
        } else if (d < bd[K - 1]) {
          let p = K - 1;
          while (p > 0 && bd[p - 1] > d) { bd[p] = bd[p - 1]; bi[p] = bi[p - 1]; p--; }
          bd[p] = d; bi[p] = j;
        }
      }
      for (let t = 0; t < K; t++) NB[i * K + t] = bi[t];
    }
  }

  // ---- working state ----
  const tour = new Int32Array(n);
  const pos = new Int32Array(n);
  const tmp = new Int32Array(n);
  const dl = new Uint8Array(n);
  const stack = [];
  let useAll = false;

  function loadTour(src) {
    for (let i = 0; i < n; i++) { tour[i] = src[i]; pos[tour[i]] = i; }
  }
  function syncPos() {
    for (let i = 0; i < n; i++) pos[tour[i]] = i;
  }
  function tourLen(t) {
    let s = 0;
    for (let i = 0; i < n - 1; i++) s += D[t[i] * n + t[i + 1]];
    return s + D[t[n - 1] * n + t[0]];
  }

  // 2-opt (neighbour list or exhaustive) + Or-opt L=1..3 (forward/reversed)
  function localSearch(src) {
    loadTour(src);
    dl.fill(0);
    stack.length = 0;
    for (let i = 0; i < n; i++) stack.push(i);
    let guard = 0;
    while (stack.length > 0) {
      if (++guard > 500000) break;
      const a = stack.pop();
      if (dl[a]) continue;
      const pa = pos[a];
      const paNext = pa + 1 === n ? 0 : pa + 1;
      const aNext = tour[paNext];
      const aPrev = tour[pa === 0 ? n - 1 : pa - 1];
      const ra = a * n, raNext = aNext * n;
      const dEdgeA = D[ra + aNext];
      let moved = false;

      const c2 = useAll ? n : 2 * K;
      for (let c = 0; c < c2; c++) {
        const b = useAll ? c : (c < K ? NB[a * K + c] : NB[aNext * K + (c - K)]);
        if (b === a || b === aNext || b === aPrev) continue;
        const pb = pos[b];
        const lo = pa < pb ? pa : pb;
        const hi = pa < pb ? pb : pa;
        if (hi - lo < 2) continue;
        const pbNext = pb + 1 === n ? 0 : pb + 1;
        const bNext = tour[pbNext];
        if (D[ra + b] + D[raNext + bNext] < dEdgeA + D[b * n + bNext]) {
          for (let i = lo + 1, j = hi; i < j; i++, j--) { const x = tour[i]; tour[i] = tour[j]; tour[j] = x; }
          syncPos();
          dl[a] = 0; dl[b] = 0; dl[aNext] = 0; dl[bNext] = 0;
          stack.push(a, b, aNext, bNext);
          moved = true;
          break;
        }
      }
      if (moved) continue;

      for (let L = 1; L <= 3; L++) {
        const s = tour[pa];
        const sMid = tour[pa + 1 === n ? 0 : pa + 1];
        const sLast = tour[pa + L - 1 >= n ? pa + L - 1 - n : pa + L - 1];
        const succ = tour[pa + L >= n ? pa + L - n : pa + L];
        const pred = tour[pa === 0 ? n - 1 : pa - 1];
        const rPred = pred * n, rS = s * n, rSL = sLast * n;
        const dRemove = D[rPred + s] + D[rSL + succ];
        const dReconnect = D[rPred + succ];
        const co = useAll ? n : 2 * K;
        for (let c = 0; c < co; c++) {
          const cand = useAll ? c : (c < K ? NB[s * K + c] : NB[sLast * K + (c - K)]);
          if (cand === pred || cand === s || cand === sLast) continue;
          if (L === 3 && cand === sMid) continue;
          const q = pos[cand];
          const q1 = q + 1 === n ? 0 : q + 1;
          const candNext = tour[q1];
          const rC = cand * n;
          const dOld = dRemove + D[rC + candNext];
          const dF = dReconnect + D[rC + s] + D[rSL + candNext] - dOld;
          const dR = dReconnect + D[rC + sLast] + D[rS + candNext] - dOld;
          let rev = false;
          if (dF < 0 && dF <= dR) rev = false;
          else if (dR < 0) rev = true;
          else continue;
          let idx = 0;
          let pp = pa + L >= n ? pa + L - n : pa + L;
          do { tmp[idx++] = tour[pp]; if (pp === q) break; pp = pp + 1 === n ? 0 : pp + 1; } while (true);
          if (!rev) { for (let t = 0; t < L; t++) tmp[idx++] = tour[pa + t >= n ? pa + t - n : pa + t]; }
          else { for (let t = L - 1; t >= 0; t--) tmp[idx++] = tour[pa + t >= n ? pa + t - n : pa + t]; }
          pp = q + 1 === n ? 0 : q + 1;
          do { tmp[idx++] = tour[pp]; if (pp === (pa === 0 ? n - 1 : pa - 1)) break; pp = pp + 1 === n ? 0 : pp + 1; } while (true);
          for (let t = 0; t < n; t++) { tour[t] = tmp[t]; pos[tour[t]] = t; }
          dl[pred] = 0; dl[s] = 0; dl[sLast] = 0; dl[succ] = 0; dl[cand] = 0; dl[candNext] = 0;
          stack.push(pred, s, sLast, succ, cand, candNext);
          moved = true;
          break;
        }
        if (moved) break;
      }
      if (!moved) dl[a] = 1;
    }
  }

  // ---- initial nearest-neighbour solutions ----
  const bestTour = new Int32Array(n);
  let bestLen = Infinity;
  const init = new Int32Array(n);
  const used = new Uint8Array(n);
  const starts = [0];
  let far = 0, fd = -1;
  for (let j = 1; j < n; j++) { const d = D[j]; if (d > fd) { fd = d; far = j; } }
  if (far !== 0) starts.push(far);
  const h = n >> 1;
  if (h !== 0 && h !== far) starts.push(h);
  if (n - 1 !== 0 && n - 1 !== far && n - 1 !== h) starts.push(n - 1);
  for (let si = 0; si < starts.length; si++) {
    const st = starts[si];
    used.fill(0);
    let cur = st, idx = 0;
    init[idx++] = st;
    used[st] = 1;
    for (let k = 1; k < n; k++) {
      let bj = -1, bd = Infinity;
      const rc = cur * n;
      for (let j = 0; j < n; j++) {
        if (used[j]) continue;
        const d = D[rc + j];
        if (d < bd) { bd = d; bj = j; }
      }
      used[bj] = 1;
      init[idx++] = bj;
      cur = bj;
    }
    localSearch(init);
    const len = tourLen(tour);
    if (len < bestLen) {
      bestLen = len;
      for (let i = 0; i < n; i++) bestTour[i] = tour[i];
    }
  }

  // ---- ILS: double bridge kick + record-to-record acceptance ----
  const curTour = new Int32Array(n);
  for (let i = 0; i < n; i++) curTour[i] = bestTour[i];
  const pert = new Int32Array(n);
  const t0 = Date.now();
  const BUDGET = 300;
  const EPS = 0.01;
  let sinceImp = 0;
  for (let it = 0; it < 100000; it++) {
    if ((it & 7) === 7 && Date.now() - t0 >= BUDGET) break;
    for (let i = 0; i < n; i++) pert[i] = curTour[i];
    const p = 1 + Math.floor(Math.random() * (n - 3));
    const q = p + 1 + Math.floor(Math.random() * (n - p - 2));
    const r = q + 1 + Math.floor(Math.random() * (n - q - 1));
    let idx = 0;
    for (let i = 0; i < p; i++) pert[idx++] = curTour[i];
    for (let i = q; i < r; i++) pert[idx++] = curTour[i];
    for (let i = p; i < q; i++) pert[idx++] = curTour[i];
    for (let i = r; i < n; i++) pert[idx++] = curTour[i];
    localSearch(pert);
    const len = tourLen(tour);
    if (len < bestLen) {
      bestLen = len;
      for (let i = 0; i < n; i++) bestTour[i] = tour[i];
      sinceImp = 0;
    } else sinceImp++;
    if (len < bestLen * (1 + EPS)) {
      for (let i = 0; i < n; i++) curTour[i] = tour[i];
    } else if (sinceImp >= 200) {
      for (let i = 0; i < n; i++) curTour[i] = bestTour[i];
      sinceImp = 0;
    }
  }

  // ---- final exhaustive polish (true 2-opt + or-opt local optimum) ----
  useAll = true;
  localSearch(bestTour);
  const out = new Array(n);
  for (let i = 0; i < n; i++) out[i] = tour[i];
  return out;
}