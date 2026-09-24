function place(size, bins) {
  let best = -1;
  let bestRem = 2;
  for (let i = 0; i < bins.length; i++) {
    if (bins[i] >= size - 1e-9 && bins[i] < bestRem) {
      best = i;
      bestRem = bins[i];
    }
  }
  return best;
}