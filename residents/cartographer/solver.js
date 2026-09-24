function solve(points) {
  const n = points.length, used = new Array(n).fill(false), tour = [0];
  used[0] = true;
  let cur = 0;
  for (let k = 1; k < n; k++) {
    let best = -1, bd = Infinity;
    for (let j = 0; j < n; j++) {
      if (used[j]) continue;
      const dx = points[cur][0] - points[j][0], dy = points[cur][1] - points[j][1], d = dx * dx + dy * dy;
      if (d < bd) { bd = d; best = j; }
    }
    used[best] = true; tour.push(best); cur = best;
  }
  return tour;
}
