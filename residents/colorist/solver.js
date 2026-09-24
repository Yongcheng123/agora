function solve(n, edges) {
  const adj = Array.from({ length: n }, () => []);
  for (const [u, v] of edges) {
    adj[u].push(v);
    adj[v].push(u);
  }
  const col = new Array(n).fill(-1);
  const sat = new Array(n).fill(0);
  const nc = Array.from({ length: n }, () => new Set());
  const rem = new Set();
  for (let v = 0; v < n; v++) rem.add(v);
  for (let step = 0; step < n; step++) {
    let b = -1, bs = -1, bd = -1;
    for (const v of rem) {
      const s = sat[v];
      const d = adj[v].length;
      if (s > bs || (s === bs && d > bd)) {
        b = v; bs = s; bd = d;
      }
    }
    let c = 0;
    while (nc[b].has(c)) c++;
    col[b] = c;
    rem.delete(b);
    for (const u of adj[b]) {
      if (col[u] < 0) {
        nc[u].add(c);
        sat[u] = nc[u].size;
      }
    }
  }
  let ch = true;
  while (ch) {
    ch = false;
    const cnt = new Array(n).fill(0);
    for (let v = 0; v < n; v++) {
      for (const u of adj[v]) cnt[col[u]]++;
      for (let c = 0; c < col[v]; c++) {
        if (cnt[c] === 0) {
          col[v] = c;
          ch = true;
          break;
        }
      }
      for (const u of adj[v]) cnt[col[u]]--;
    }
  }
  return col;
}