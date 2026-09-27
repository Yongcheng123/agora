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
    for (let j = i + 1; j < n; j++) {
      const dx = xi - points[j][0];
      const dy = yi - points[j][1];
      const d = dx * dx + dy * dy;
      D[i * n + j] = d;
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

  function runLS(tour, twoIters, orIters) {
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
        const dBase = D[ti * n + ti1];
        let foundMove = false;
        for (let k = i + 2; k < n; k++) {
          if (i === 0 && k === n - 1) continue;
          const tk = tour[k];
          const tk1 = (k + 1 < n) ? tour[k + 1] : tour[0];
          const dNew = D[ti * n + tk] + D[ti1 * n + tk1];
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

    for (const L of [1, 2, 3]) {
      const dlo = new Uint8Array(n);
      let oImproved = true;
      let oIter = 0;
      while (oImproved && oIter < orIters) {
        oImproved = false;
        oIter++;
        for (let s = 0; s < n; s++) {
          if (dlo[s]) continue;
          const pred = (s - 1 + n) % n;
          const succ = (s + L) % n;
          const tPred = tour[pred];
          const tS = tour[s];
          const tSL1 = tour[(s + L - 1) % n];
          const tSucc = tour[succ];
          const dRemove = D[tPred * n + tS] + D[tSL1 * n + tSucc];
          const dReconnect = D[tPred * n + tSucc];
          let foundMove = false;
          for (let k = 0; k < n; k++) {
            const kNext = (k + 1) % n;
            if (s <= succ) {
              if (kNext >= s && kNext <= succ) continue;
            } else {
              if (kNext >= s || kNext <= succ) continue;
            }
            const tk = tour[k];
            const tk1 = tour[kNext];
            const dAdd = D[tk * n + tS] + D[tSL1 * n + tk1] + dReconnect;
            if (dAdd < dRemove) {
              let idx = 0;
              newTour[idx++] = tPred;
              let p = succ;
              while (p !== kNext) {
                newTour[idx++] = tour[p];
                p = (p + 1) % n;
              }
              for (let q = 0; q < L; q++) {
                newTour[idx++] = tour[(s + q) % n];
              }
              p = kNext;
              while (p !== pred) {
                newTour[idx++] = tour[p];
                p = (p + 1) % n;
              }
              for (let i2 = 0; i2 < n; i2++) tour[i2] = newTour[i2];
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
    for (let i = 0; i < n; i++) {
      const a = t[i], b = t[(i + 1) % n];
      s += D[a * n + b];
    }
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
      for (let j = 0; j < n; j++) {
        if (used[j]) continue;
        const d = D[cur * n + j];
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

  for (let r = 0; r < 8; r++) {
    const c1 = 1 + (Math.floor(Math.random() * (n - 1)));
    const c2 = c1 + 1 + Math.floor(Math.random() * (n - c1 - 1));
    const c3 = c2 + 1 + Math.floor(Math.random() * (n - c2 - 1));
    const perturbed = new Array(n);
    let idx = 0;
    for (let i = 0; i <= c1; i++) perturbed[idx++] = bestTour[i];
    for (let i = c2 + 1; i <= c3; i++) perturbed[idx++] = bestTour[i];
    for (let i = c3 + 1; i < n; i++) perturbed[idx++] = bestTour[i];
    for (let i = c1 + 1; i <= c2; i++) perturbed[idx++] = bestTour[i];

    runLS(perturbed, 10, 3);

    const lenSq = tourLen(perturbed);
    if (lenSq < bestLenSq) {
      bestLenSq = lenSq;
      bestTour = perturbed;
    }
  }

  return bestTour;
}