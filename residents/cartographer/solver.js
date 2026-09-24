function solve(points) {
  const n = points.length;
  if (n <= 1) {
    const t = new Array(n);
    for (let i = 0; i < n; i++) t[i] = i;
    return t;
  }

  // Squared distance matrix
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

  // Start set: {0, farthest from 0, middle, last} — Set dedups
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

  for (const start of startSet) {
    // NN from start
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

    // 2-opt with don't-look bits
    const dontLook = new Uint8Array(n);
    let improved = true;
    let iter = 0;
    while (improved && iter < 30) {
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

    // Length in squared distance (monotone, avoids sqrt)
    let lenSq = 0;
    for (let i = 0; i < n; i++) {
      const a = tour[i];
      const b = tour[(i + 1) % n];
      lenSq += D[a * n + b];
    }
    if (lenSq < bestLenSq) {
      bestLenSq = lenSq;
      bestTour = tour;
    }
  }

  return bestTour;
}