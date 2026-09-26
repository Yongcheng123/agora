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
  function tabucolTry(col, targetK, maxIter) {
    const K = targetK;
    if (K < 2) return null;
    const work = new Int32Array(n);
    for (let v = 0; v < n; v++) work[v] = col[v] % K;
    const adjCC = new Int32Array(n * K);
    const conflicts = new Int32Array(n);
    const tabu = new Int32Array(n * K);
    let totalConflicts = 0;
    for (let v = 0; v < n; v++) {
      const wv = work[v];
      const baseV = v * K;
      for (const u of adj[v]) {
        const wu = work[u];
        adjCC[baseV + wu]++;
        if (wu === wv) conflicts[v]++;
      }
    }
    for (let v = 0; v < n; v++) totalConflicts += conflicts[v];
    totalConflicts >>= 1;
    if (totalConflicts === 0) return work;
    let bestWork = new Int32Array(work);
    let bestConflicts = totalConflicts;
    const tenureBase = 5;
    for (let iter = 0; iter < maxIter; iter++) {
      let bestV = -1, bestC = -1;
      let bestDelta = Infinity;
      let ties = 0;
      for (let v = 0; v < n; v++) {
        if (conflicts[v] === 0) continue;
        const cv = work[v];
        const baseV = v * K;
        const confV = adjCC[baseV + cv];
        for (let c = 0; c < K; c++) {
          if (c === cv) continue;
          const newC = adjCC[baseV + c];
          const delta = newC - confV;
          const newTotal = totalConflicts + delta;
          const isTabu = iter < tabu[v * K + c];
          if (isTabu && newTotal >= bestConflicts) continue;
          if (delta < bestDelta) {
            bestDelta = delta;
            bestV = v;
            bestC = c;
            ties = 1;
          } else if (delta === bestDelta) {
            ties++;
            if (Math.random() * ties < 1) {
              bestV = v;
              bestC = c;
            }
          }
        }
      }
      if (bestV < 0) break;
      const v = bestV;
      const cOld = work[v];
      const cNew = bestC;
      work[v] = cNew;
      const tenure = tenureBase + ((Math.random() * tenureBase) | 0);
      tabu[v * K + cOld] = iter + tenure;
      for (const u of adj[v]) {
        const baseU = u * K;
        adjCC[baseU + cOld]--;
        adjCC[baseU + cNew]++;
        if (work[u] === cOld) conflicts[u]--;
        else if (work[u] === cNew) conflicts[u]++;
      }
      conflicts[v] = adjCC[v * K + cNew];
      totalConflicts += bestDelta;
      if (totalConflicts < bestConflicts) {
        bestConflicts = totalConflicts;
        bestWork = new Int32Array(work);
        if (bestConflicts === 0) break;
      }
    }
    return bestConflicts === 0 ? bestWork : null;
  }
  const K_RESTARTS = 7;
  let bestCol = null;
  let bestK = Infinity;
  for (let k = 0; k < K_RESTARTS; k++) {
    const rng = k === 0 ? null : Math.random;
    const col = dsatur(rng);
    recolorFixed(col);
    let cur = kempeReduce(col);
    recolorFixed(cur);
    let ck = numColors(cur);
    for (let attempt = 0; attempt < 2 && ck > 2; attempt++) {
      const reduced = tabucolTry(cur, ck - 1, 100);
      if (!reduced) break;
      recolorFixed(reduced);
      const ck2 = numColors(reduced);
      if (ck2 >= ck) break;
      cur = reduced;
      ck = ck2;
    }
    if (ck < bestK) {
      bestCol = new Int32Array(cur);
      bestK = ck;
    }
  }
  let cur = new Int32Array(bestCol);
  let curK = bestK;
  for (let attempt = 0; attempt < 4 && curK > 2; attempt++) {
    const reduced = tabucolTry(cur, curK - 1, 200);
    if (!reduced) break;
    recolorFixed(reduced);
    const newK = numColors(reduced);
    if (newK >= curK) break;
    cur = reduced;
    curK = newK;
  }
  const kemped = kempeReduce(cur);
  recolorFixed(kemped);
  const finalK = numColors(kemped);
  if (finalK < curK) {
    cur = kemped;
    curK = finalK;
  }
  bestCol = cur;
  return Array.from(bestCol);
}