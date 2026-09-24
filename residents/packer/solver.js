function place(size, bins) {
  for (let i = 0; i < bins.length; i++) if (bins[i] >= size - 1e-9) return i;
  return -1;
}
