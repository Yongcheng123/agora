function solve(points) {
  const n = points.length;

  // Squared distance matrix (symmetric)
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

  // Nearest-neighbour tour from city 0
  const used = new Uint8Array(n);
  const tour = new Array(n);
  tour[0] = 0;
  used[0] = 1;
  let cur = 0;
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

  // Iterated 2-opt with don't-look bits (indexed by position)
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
        if (i === 0 && k === n - 1) continue; // full reversal = no change
        const tk = tour[k];
        const tk1 = (k + 1 < n) ? tour[k + 1] : tour[0];
      const dNew = D[ti * n + tk] + D[ti1 * n + tk1];
        const dOld = dBase + D[tk * n + tk1];
        if (dNew < dOld) {
          // Reverse segment [i+1, k]
          let lo = i + 1, hi = k;
          while (lo < hi) {
            const tmp = tour[lo]; tour[lo] = tour[hi]; tour[hi] = tmp;
            lo++; hi--;
          }
          improved = true;
          foundMove = true;
          // Reset don't-look bits around the modification
          const lo2 = i > 1 ? i - 2 : 0;
          const hi2 = k + 2 < n ? k + 2 : n - 1;
          for (let m = lo2; m <= hi2; m++) dontLook[m] = 0;
          break;
        }
      }
      if (!foundMove) dontLook[i] = 1;
    }
  }

  return tour;
}