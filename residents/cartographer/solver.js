function solve(points) {
  const n = points.length;
  if (n <= 1) {
    const t = new Array(n);
    for (let i = 0; i < n; i++) t[i] = i;
    return t;
  }

  const D = new Float64Array(n * n);
  for (let i = 0; i < n; i++) {
    const xi = points[i][0], yi = points[i][1];
    const ro = i * n;
    for (let j = i + 1; j < n; j++) {
      const dx = xi - points[j][0];
      const dy = yi - points[j][1];
      const d = dx * dx + dy * dy;
      D[ro + j] = d;
      D[j * n + i] = d;
    }
  }

  const startSet = new Set();
  startSet.add(0);
  let farIdx = 0, farD = -1;
  for (let j = 1; j < n; j++) {
    const d = D[j];
    if (d > farD) { farD = d; farIdx = j; }
  }
  startSet.add(farIdx);
  startSet.add(n >> 1);
  startSet.add(n - 1);

  let bestTour = null;
  let bestLenSq = Infinity;
  const newTour = new Array(n);
  const T2 = new Int32Array(2 * n);

  function runLS(tour, twoIters, orIters) {
    for (let i = 0; i < n; i++) { const v = tour[i]; T2[i] = v; T2[i + n] = v; }

    const dontLook = new Uint8Array(n);
    let improved = true;
    let iter = 0;
    while (improved && iter < twoIters) {
      improved = false;
      iter++;
      for (let i = 0; i < n - 1; i++) {
        if (dontLook[i]) continue;
        const ti = tour[i];
        const ti1 = tour[i + 1];
        const ti_n = ti * n;
        const ti1_n = ti1 * n;
        const dBase = D[ti_n + ti1];
        const kEnd = (i === 0) ? n - 1 : n;
        let foundMove = false;
        for (let k = i + 2; k < kEnd; k++) {
          const tk = tour[k];
          const tk1 = (k + 1 < n) ? tour[k + 1] : tour[0];
          const dNew = D[ti_n + tk] + D[ti1_n + tk1];
          const dOld = dBase + D[tk * n + tk1];
          if (dNew < dOld) {
            let lo = i + 1, hi = k;
            while (lo < hi) {
              const tmp = tour[lo]; tour[lo] = tour[hi]; tour[hi] = tmp;
              lo++; hi--;
            }
            improved = true;
            foundMove = true;
            const lo2 = i > 1 ? i - 2 : 0;
            const hi2 = k + 2 < n ? k + 2 : n - 1;
            for (let m = lo2; m <= hi2; m++) dontLook[m] = 0;
            break;
          }
        }
        if (!foundMove) dontLook[i] = 1;
      }
    }

    for (let i = 0; i < n; i++) { const v = tour[i]; T2[i] = v; T2[i + n] = v; }

    for (let L = 1; L <= 3; L++) {
      const dlo = new Uint8Array(n);
      let oImproved = true;
      let oIter = 0;
      while (oImproved && oIter < orIters) {
        oImproved = false;
        oIter++;
        for (let s = 0; s < n; s++) {
          if (dlo[s]) continue;
          let pred = s - 1; if (pred < 0) pred = n - 1;
          let succ = s + L; if (succ >= n) succ -= n;
          const tPred = T2[pred];
          const tS = T2[s];
          const tSL1 = T2[s + L - 1];
          const tSucc = T2[succ];
          const rS = tS * n;
          const rSL1 = tSL1 * n;
          const rPred = tPred * n;
          const dRemoveBase = D[rPred + tS] + D[rSL1 + tSucc];
          const dReconnect = D[rPred + tSucc];
          let foundMove = false;
          for (let k = 0; k < n; k++) {
            let kp = k + 1;
            let kpw = kp;
            if (kp === n) { kp = 0; kpw = 0; }
            if (s <= succ) {
              if (kpw >= s && kpw <= succ) continue;
            } else {
              if (kpw >= s || kpw <= succ) continue;
            }
            const tk = T2[k];
            const tk1 = T2[kp];
            const rk = tk * n;
            const dEdgeBreak = D[rk + tk1];
            let bestDAdd = D[rk + tS] + D[rSL1 + tk1] + dReconnect;
            let useReverse = false;
            if (L >= 2) {
              const dAddRev = D[rk + tSL1] + D[rS + tk1] + dReconnect;
              if (dAddRev < bestDAdd) {
                bestDAdd = dAddRev;
                useReverse = true;
              }
            }
            if (bestDAdd < dRemoveBase + dEdgeBreak) {
              let idx = 0;
              newTour[idx++] = tPred;
              let p = succ;
              while (p !== kpw) {
                newTour[idx++] = T2[p];
                p++; if (p === n) p = 0;
              }
              if (useReverse) {
                for (let q = L - 1; q >= 0; q--) newTour[idx++] = T2[s + q];
              } else {
                for (let q = 0; q < L; q++) newTour[idx++] = T2[s + q];
              }
              p = kpw;
              while (p !== pred) {
                newTour[idx++] = T2[p];
                p++; if (p === n) p = 0;
              }
              for (let i2 = 0; i2 < n; i2++) { const v = newTour[i2]; tour[i2] = v; T2[i2] = v; T2[i2 + n] = v; }
              oImproved = true;
              foundMove = true;
              for (let m = 0; m < n; m++) dlo[m] = 0;
              break;
            }
          }
          if (!foundMove) dlo[s] = 1;
        }
      }
    }
  }

  function tourLen(t) {
    let s = 0;
    for (let i = 0; i < n - 1; i++) s += D[t[i] * n + t[i + 1]];
    s += D[t[n - 1] * n + t[0]];
    return s;
  }

  for (const start of startSet) {
    const tour = new Array(n);
    const used = new Uint8Array(n);
    tour[0] = start;
    used[start] = 1;
    let cur = start;
    for (let k = 1; k < n; k++) {
      let best = -1, bd = Infinity;
      const rc = cur * n;
      for (let j = 0; j < n; j++) {
        if (used[j]) continue;
        const d = D[rc + j];
        if (d < bd) { bd = d; best = j; }
      }
      used[best] = 1;
      tour[k] = best;
      cur = best;
    }

    runLS(tour, 30, 5);

    const lenSq = tourLen(tour);
    if (lenSq < bestLenSq) {
      bestLenSq = lenSq;
      bestTour = tour;
    }
  }

  const ILS_MS = 200;
  const tStart = Date.now();
  const KMAX = 400;

  for (let r = 0; r < KMAX; r++) {
    let fam;
    if (n < 6) fam = 2;
    else if (r < 4) fam = 0;
    else if (r < 8) fam = 1;
    else if (r < 12) fam = 2;
    else fam = r % 3;

    if (r >= 12 && Date.now() - tStart > ILS_MS) break;

    const perturbed = new Array(n);
    let idx = 0;
    if (fam === 2) {
      if (n > 2) {
        const i = 1 + Math.floor(Math.random() * (n - 2));
        const j = i + 1 + Math.floor(Math.random() * (n - i - 1));
        for (let p = 0; p < n; p++) perturbed[p] = bestTour[p];
        let lo = i, hi = j;
        while (lo < hi) {
          const tmp = perturbed[lo]; perturbed[lo] = perturbed[hi]; perturbed[hi] = tmp;
          lo++; hi--;
        }
      } else {
        for (let p = 0; p < n; p++) perturbed[p] = bestTour[p];
      }
    } else {
      const c1 = 1 + Math.floor(Math.random() * (n - 4));
      const c2 = c1 + 1 + Math.floor(Math.random() * (n - c1 - 3));
      const c3 = c2 + 1 + Math.floor(Math.random() * (n - c2 - 2));
      if (fam === 0) {
        for (let i = 0; i <= c1; i++) perturbed[idx++] = bestTour[i];
        for (let i = c2 + 1; i <= c3; i++) perturbed[idx++] = bestTour[i];
        for (let i = c3 + 1; i < n; i++) perturbed[idx++] = bestTour[i];
        for (let i = c1 + 1; i <= c2; i++) perturbed[idx++] = bestTour[i];
      } else {
        for (let i = 0; i <= c1; i++) perturbed[idx++] = bestTour[i];
        for (let i = c3 + 1; i < n; i++) perturbed[idx++] = bestTour[i];
        for (let i = c1 + 1; i <= c2; i++) perturbed[idx++] = bestTour[i];
        for (let i = c2 + 1; i <= c3; i++) perturbed[idx++] = bestTour[i];
      }
    }

    runLS(perturbed, 10, 3);

    const lenSq = tourLen(perturbed);
    if (lenSq < bestLenSq) {
      bestLenSq = lenSq;
      bestTour = perturbed;
    }
  }

  return bestTour;
}