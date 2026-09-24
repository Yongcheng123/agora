function solve(n, edges) {
  const adj = Array.from({ length: n }, () => []);
  for (const [u, v] of edges) {
    adj[u].push(v);
    adj[v].push(u);
  }
  const deg = new Int32Array(n);
  for (let v = 0; v < n; v++) deg[v] = adj[v].length;

  function dsatur(rng) {
    const col = new Int32Array(n).fill(-1);
    const sat = new Int32Array(n);
    const nc = Array.from({ length: n }, () => new Set());
    const inRem = new Uint8Array(n).fill(1);
    for (let step = 0; step < n; step++) {
      let b = -1, bs = -1, bd = -1;
      for (let v = 0; v < n; v++) {
        if (!inRem[v]) continue;
        const s = sat[v];
        const d = deg[v];
        if (s > bs || (s === bs && d > bd)) { b = v; bs = s; bd = d; }
      }
      if (rng) {
        let tc = 0;
        for (let v = 0; v < n; v++) {
          if (inRem[v] && sat[v] === bs && deg[v] === bd) tc++;
        }
        if (tc > 1) {
          const pick = Math.floor(rng() * tc);
          let i = 0;
          for (let v = 0; v < n; v++) {
            if (inRem[v] && sat[v] === bs && deg[v] === bd) {
              if (i === pick) { b = v; break; }
              i++;
            }
          }
        }
      }
      let c = 0;
      while (nc[b].has(c)) c++;
      col[b] = c;
      inRem[b] = 0;
      for (const u of adj[b]) {
        if (inRem[u]) {
          nc[u].add(c);
          sat[u] = nc[u].size;
        }
      }
    }
    return col;
  }

  function recolor(col) {
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

  function numColors(col) {
    let mx = 0;
    for (let v = 0; v < n; v++) if (col[v] > mx) mx = col[v];
    return mx + 1;
  }

  function makeRng(seed) {
    let s = (seed >>> 0) || 1;
    return function () {
      s = (s * 1664525 + 1013904223) >>> 0;
      return s / 4294967296;
    };
  }

  const K = 12;
  let bestCol = null;
  let bestK = Infinity;
  for (let k = 0; k < K; k++) {
    const rng = k === 0 ? null : makeRng(k);
    const col = dsatur(rng);
    recolor(col);
    const ck = numColors(col);
    if (ck < bestK) {
      bestCol = new Int32Array(col);
      bestK = ck;
    }
  }
  return Array.from(bestCol);
}