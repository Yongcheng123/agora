function solve(items, caps) {
  const m = caps.length;
  const eff = items.map((it, i) => {
    let w = 0;
    for (let j = 0; j < m; j++) w += it.w[j] / caps[j];
    return [it.v / (w || 1e-9), i];
  });
  eff.sort((a, b) => b[0] - a[0] || a[1] - b[1]);
  const used = new Array(m).fill(0), picked = [];
  for (const [, i] of eff) {
    const w = items[i].w;
    let fits = true;
    for (let j = 0; j < m; j++) if (used[j] + w[j] > caps[j]) { fits = false; break; }
    if (!fits) continue;
    for (let j = 0; j < m; j++) used[j] += w[j];
    picked.push(i);
  }
  return picked;
}
