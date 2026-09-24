function solve(n, edges) {
  const adj = Array.from({ length: n }, () => []);
  for (const [u, v] of edges) {
    adj[u].push(v);
    adj[v].push(u);
  }
  const order = Array.from({ length: n }, (_, v) => v);
  order.sort((a, b) => adj[b].length - adj[a].length || a - b);
  const colors = new Array(n).fill(-1);
  for (const v of order) {
    const used = new Set();
    for (const u of adj[v]) if (colors[u] >= 0) used.add(colors[u]);
    let c = 0;
    while (used.has(c)) c++;
    colors[v] = c;
  }
  return colors;
}
