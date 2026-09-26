function solve(n, edges) {
  const adj = [];
  for (let i = 0; i < n; i++) adj.push([]);
  for (const [u, v] of edges) {
    adj[u].push(v); adj[v].push(u);
  }
  const deg = new Int32Array(n);
  for (let v = 0; v < n; v++) deg[v] = adj[v].length;
  function dsatur(rng) {
    const col = new Int32Array(n).fill(-1);
    const sat = new Int32Array(n);
    const mask = new Int32Array(n);
    const inRem = new Uint8Array(n).fill(1);
    for (let step = 0; step < n; step++) {
      let b = -1, bs = -1, bd = -1;
      for (let v = 0; v < n; v++) {
        if (!inRem[v]) continue;
        const s = sat[v], d = deg[v];
        if (s > bs || (s === bs && d > bd)) { b = v; bs = s; bd = d; }
      }
      if (rng) {
        let tc = 0, pickV = -1;
        for (let v = 0; v < n; v++) {
          if (inRem[v] && sat[v] === bs && deg[v] === bd) {
            tc++;
            if (rng() < 1 / tc) pickV = v;
          }
        }
        if (pickV >= 0) b = pickV;
      }
      let c = 0;
      const m = mask[b];
      while (m & (1 << c)) c++;
      col[b] = c;
      inRem[b] = 0;
      const cm = 1 << c;
      for (const u of adj[b]) {
        if (inRem[u] && !(mask[u] & cm)) {
 mask[u] |= cm;
          sat[u]++;
        }
      }
    }
    return col;
  }
  function recolorFixed(col) {
    let ch = true;
    while (ch) {
      ch = false;
      const cnt = new Int32Array(n);
      for (let v = 0; v < n; v++) {
        for (const u of adj[v]) cnt[col[u]]++;
        for (let c = 0; c < col[v]; c++) {
          if (cnt[c] === 0) { col[v] = c; ch = true; break; }
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
  function kempeReduce(col) {
    const work = new Int32Array(col);
    const visited = new Uint8Array(n);
    const queue = new Int32Array(n);
    let curB = numColors(work);
    const maxOuter = Math.min(curB - 1, 6);
    let outer = 0;
    while (curB > 1 && outer < maxOuter) {
      outer++;
      const cMax = curB - 1;
      let improved = false;
      for (let cOther = 0; cOther < cMax && !improved; cOther++) {
        visited.fill(0);
        for (let start = 0; start < n; start++) {
          if (visited[start]) continue;
          if (work[start] !== cMax && work[start] !== cOther) continue;
          const comp = [];
          let qs = 0, qe = 0;
          queue[qe++] = start;
          visited[start] = 1;
          while (qs < qe) {
            const v = queue[qs++];
            comp.push(v);
            for (const u of adj[v]) {
              if (!visited[u] && (work[u] === cMax || work[u] === cOther)) {
                visited[u] = 1;
                queue[qe++] = u;
              }
            }
          }
          const trial = new Int32Array(work);
          for (const v of comp) trial[v] = work[v] === cMax ? cOther : cMax;
          for (const v of comp) {
            let used = 0;
            for (const u of adj[v]) used |= (1 << trial[u]);
            let c = 0;
            while (used & (1 << c)) c++;
            trial[v] = c;
          }
          let cMaxUsed = false;
          for (let v = 0; v < n; v++) {
            if (trial[v] === cMax) { cMaxUsed = true; break; }
          }
          if (!cMaxUsed) {
            for (let v = 0; v < n; v++) work[v] = trial[v];
            let mx = 0;
            for (let v = 0; v < n; v++) if (work[v] > mx) mx = work[v];
            curB = mx + 1;
            improved = true;
            break;
          }
        }
      }
      if (!improved) break;
    }
    return work;
  }
  const K_RESTARTS = 10;
  let bestCol = null;
  let bestK = Infinity;
  for (let k = 0; k < K_RESTARTS; k++) {
    const rng = k === 0 ? null : Math.random;
    const col = dsatur(rng);
    recolorFixed(col);
    const kemped = kempeReduce(col);
    recolorFixed(kemped);
    const ck = numColors(kemped);
    if (ck < bestK) {
      bestCol = new Int32Array(kemped);
      bestK = ck;
    }
  }
  const finalKemped = kempeReduce(bestCol);
  recolorFixed(finalKemped);
  if (numColors(finalKemped) < bestK) bestCol = finalKemped;
  return Array.from(bestCol);
}