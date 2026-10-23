function solve(n, edges) {
  const adj = [];
  for (let i = 0; i < n; i++) adj.push([]);
  for (const e of edges) { const u = e[0]; const v = e[1]; adj[u].push(v); adj[v].push(u); }
  const deg = new Int32Array(n);
  for (let v = 0; v < n; v++) deg[v] = adj[v].length;

  const NB = n + 1;
  const T0 = Date.now();
  const bud = { left: Infinity };
  const usedArr = new Int32Array(n + 2);
  let ustm = 0;

  // G54 safety: colour choice without 32-bit masks (K can exceed 31 at p=0.5)
  function firstFree(v, col) {
    ustm++;
    const al = adj[v];
    for (let i = 0; i < al.length; i++) {
      const cu = col[al[i]];
      if (cu >= 0) usedArr[cu] = ustm;
    }
    let c = 0;
    while (usedArr[c] === ustm) c++;
    return c;
  }

  function dsatur(rng) {
    const col = new Int32Array(n).fill(-1);
    const sat = new Int32Array(n);
    const seen = new Int32Array(n * NB);
    const inRem = new Uint8Array(n).fill(1);
    let gen = 0;
    for (let step = 0; step < n; step++) {
      gen++;
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
      const al = adj[b];
      const base = b * NB;
      for (let i = 0; i < al.length; i++) {
        const cu = col[al[i]];
        if (cu >= 0) seen[base + cu] = gen;
      }
      let c = 0;
      while (seen[base + c] === gen) c++;
      col[b] = c;
      inRem[b] = 0;
      for (let i = 0; i < al.length; i++) {
        const u = al[i];
        if (inRem[u] && seen[u * NB + c] !== gen) { seen[u * NB + c] = gen; sat[u]++; }
      }
    }
    return col;
  }

  function recolorFixed(col) {
    let ch = true;
    while (ch) {
      ch = false;
      const cnt = new Int32Array(NB);
      for (let v = 0; v < n; v++) {
        const al = adj[v];
        for (let i = 0; i < al.length; i++) cnt[col[al[i]]]++;
        for (let c = 0; c < col[v]; c++) {
          if (cnt[c] === 0) { col[v] = c; ch = true; break; }
        }
        for (let i = 0; i < al.length; i++) cnt[col[al[i]]]--;
      }
    }
    return col;
  }

  function numColors(col) {
    let mx = 0;
    for (let v = 0; v < n; v++) if (col[v] > mx) mx = col[v];
    return mx + 1;
  }

  function kempeReduce(work) {
    let curB = numColors(work);
    const maxOuter = Math.min(curB - 1, 6);
    const visited = new Uint8Array(n);
    const queue = new Int32Array(n);
    const trial = new Int32Array(n);
    let outer = 0;
    while (curB > 1 && outer < maxOuter) {
      outer++;
      const cMax = curB - 1;
      let improved = false;
      for (let cOther = 0; cOther < cMax && !improved; cOther++) {
        visited.fill(0);
        for (let start = 0; start < n && !improved; start++) {
          if (visited[start]) continue;
          if (work[start] !== cMax && work[start] !== cOther) continue;
          const comp = [];
          let qs = 0, qe = 0;
          queue[qe++] = start;
          visited[start] = 1;
          while (qs < qe) {
            const v = queue[qs++];
            comp.push(v);
            const al = adj[v];
            for (let i = 0; i < al.length; i++) {
              const u = al[i];
              if (!visited[u] && (work[u] === cMax || work[u] === cOther)) {
                visited[u] = 1; queue[qe++] = u;
              }
            }
          }
          trial.set(work);
          for (const v of comp) trial[v] = work[v] === cMax ? cOther : cMax;
          for (const v of comp) trial[v] = firstFree(v, trial);
          let cMaxUsed = false;
          for (let v = 0; v < n; v++) {
            if (trial[v] === cMax) { cMaxUsed = true; break; }
          }
          if (!cMaxUsed) {
            work.set(trial);
            let mx = 0;
            for (let v = 0; v < n; v++) if (work[v] > mx) mx = work[v];
            curB = mx + 1;
            improved = true;
          }
        }
      }
      if (!improved) break;
    }
    return work;
  }

  function kempePerturb(work, K) {
    if (K < 2) return;
    const clsSize = new Int32Array(K);
    for (let v = 0; v < n; v++) clsSize[work[v]]++;
    let cA = 0;
    for (let c = 1; c < K; c++) if (clsSize[c] > clsSize[cA]) cA = c;
    if (clsSize[cA] < 2) return;
    let cB = -1;
    let safety = 0;
    while (safety++ < 50) {
      const c = (Math.random() * K) | 0;
      if (c !== cA && clsSize[c] > 0) { cB = c; break; }
    }
    if (cB < 0) return;
    let start = -1, startDeg = -1, ties = 0;
    for (let v = 0; v < n; v++) {
      if (work[v] === cA) {
        const d = deg[v];
        if (d > startDeg) { startDeg = d; ties = 1; start = v; }
        else if (d === startDeg) { ties++; if (Math.random() * ties < 1) start = v; }
      }
    }
    if (start < 0) return;
    const inComp = new Uint8Array(n);
    const queue = new Int32Array(n);
    let qs = 0, qe = 0;
    queue[qe++] = start;
    inComp[start] = 1;
    while (qs < qe) {
      const v = queue[qs++];
      const al = adj[v];
      for (let i = 0; i < al.length; i++) {
        const u = al[i];
        if (!inComp[u] && (work[u] === cA || work[u] === cB)) {
          inComp[u] = 1; queue[qe++] = u;
        }
      }
    }
    for (let v = 0; v < n; v++) {
      if (inComp[v]) {
        if (work[v] === cA) work[v] = cB;
        else if (work[v] === cB) work[v] = cA;
      }
    }
  }

  // G54: global iteration counter caps total work; 800ms wall brake is a pure safety net
  function tabucolRun(work, K, maxIter) {
    let cap = maxIter;
    if (bud.left < cap) cap = bud.left;
    if (cap <= 0) return null;
    bud.left -= cap;
    const adjCC = new Int32Array(n * K);
    const conflicts = new Int32Array(n);
    const tabu = new Int32Array(n * K);
    const freq = new Int32Array(n * K);
    let totalConflicts = 0;
    for (let v = 0; v < n; v++) {
      const wv = work[v];
      const baseV = v * K;
      const al = adj[v];
      for (let i = 0; i < al.length; i++) {
        const u = al[i];
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
    for (let iter = 0; iter < cap; iter++) {
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
            bestDelta = delta; bestV = v; bestC = c; ties = 1;
          } else if (delta === bestDelta) {
            ties++;
            const curF = freq[v * K + c];
            const bestF = freq[bestV * K + bestC];
            if (curF < bestF) { bestV = v; bestC = c; }
            else if (curF === bestF && Math.random() * ties < 1) { bestV = v; bestC = c; }
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
      const al = adj[v];
      for (let i = 0; i < al.length; i++) {
        const u = al[i];
        const baseU = u * K;
        adjCC[baseU + cOld]--;
        adjCC[baseU + cNew]++;
        if (work[u] === cOld) conflicts[u]--;
        else if (work[u] === cNew) conflicts[u]++;
      }
      conflicts[v] = adjCC[v * K + cNew];
      freq[v * K + cOld]++;
      freq[v * K + cNew]++;
      totalConflicts += bestDelta;
      if (totalConflicts < bestConflicts) {
        bestConflicts = totalConflicts;
        bestWork = new Int32Array(work);
        if (bestConflicts === 0) break;
      }
      if ((iter & 255) === 255) {
        if (Date.now() - T0 > 800) break;
      }
      if ((iter & 63) === 63) {
        for (let i = 0; i < freq.length; i++) freq[i] >>= 2;
      }
    }
    return bestConflicts === 0 ? bestWork : null;
  }

  function tabucolTry(col, targetK, maxIter) {
    const K = targetK;
    if (K < 2) return null;
    const ec = new Int32Array(K);
    for (let v = 0; v < n; v++) {
      if (col[v] >= K) {
        const al = adj[v];
        for (let i = 0; i < al.length; i++) if (col[al[i]] < K) ec[col[al[i]]]++;
      }
    }
    let bestI = 0;
    for (let i = 1; i < K; i++) if (ec[i] < ec[bestI]) bestI = i;
    let work = new Int32Array(n);
    for (let v = 0; v < n; v++) work[v] = col[v] >= K ? bestI : col[v];
    let r = tabucolRun(work, K, maxIter);
    if (r) return r;
    work = new Int32Array(n);
    for (let v = 0; v < n; v++) work[v] = (Math.random() * K) | 0;
    r = tabucolRun(work, K, maxIter);
    if (r) return r;
    work = new Int32Array(n);
    for (let v = 0; v < n; v++) work[v] = col[v] >= K ? bestI : col[v];
    const cf = new Int32Array(n);
    for (let v = 0; v < n; v++) {
      const al = adj[v];
      for (let i = 0; i < al.length; i++) if (work[al[i]] === work[v]) cf[v]++;
    }
    const N_KICK = Math.max(5, Math.floor(n / 15));
    const ids = new Int32Array(n);
    for (let v = 0; v < n; v++) ids[v] = v;
    ids.sort((a, b) => cf[b] - cf[a]);
    for (let i = 0; i < N_KICK && i < n; i++) work[ids[i]] = (Math.random() * K) | 0;
    r = tabucolRun(work, K, maxIter);
    if (r) return r;
    work = new Int32Array(n);
    for (let v = 0; v < n; v++) work[v] = col[v] >= K ? bestI : col[v];
    kempePerturb(work, K);
    r = tabucolRun(work, K, maxIter);
    if (r) return r;
    work = new Int32Array(n);
    for (let v = 0; v < n; v++) work[v] = col[v] >= K ? bestI : col[v];
    kempePerturb(work, K);
    kempePerturb(work, K);
    return tabucolRun(work, K, maxIter);
  }

  function descendColoring(startCol, startK, attempts, iter) {
    let cur = new Int32Array(startCol);
    let curK = startK;
    let fails = 0;
    for (let attempt = 0; attempt < attempts && curK > 2; attempt++) {
      const reduced = tabucolTry(cur, curK - 1, iter);
      if (!reduced) {
        fails++;
        if (fails >= 2) break;
        continue;
      }
      recolorFixed(reduced);
      const newK = numColors(reduced);
      cur = reduced;
      if (newK < curK) {
        curK = newK;
        fails = 0;
      } else {
        fails++;
        if (fails >= 2) break;
      }
    }
    if (fails >= 2 && curK >= 5) {
      const target = curK - 2;
      const reduced = tabucolTry(cur, target, iter);
      if (reduced) {
        recolorFixed(reduced);
        const newK = numColors(reduced);
        if (newK < curK) { cur = reduced; curK = newK; }
      }
    }
    return { col: cur, k: curK };
  }

  const K_RESTARTS = 9;
  let bestCol = null, bestK = Infinity, top2Col = null, top2K = Infinity;
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
      top2Col = bestCol; top2K = bestK;
      bestCol = new Int32Array(cur); bestK = ck;
    } else if (ck < top2K) {
      top2Col = new Int32Array(cur); top2K = ck;
    }
  }

  let useTop2 = false;
  if (top2Col && top2K <= bestK + 1) {
    if (top2K > bestK) {
      useTop2 = true;
    } else {
      let diff = 0;
      for (let v = 0; v < n; v++) if (top2Col[v] !== bestCol[v]) diff++;
      if (diff > (n >> 2)) useTop2 = true;
    }
  }

  // === G54: work-based iteration budget ===
  // one tabucol iteration ~= n*K (vertex,colour) slots; fix the slot budget per run
  // and the total slot budget for the whole descent chain, converted with n*K.
  const Kscan = bestK > 4 ? bestK - 1 : 4;
  const costPerIter = Math.max(1, n * Kscan);
  const SLOT_PER_RUN = 6500000;
  let perRun = Math.round(SLOT_PER_RUN / costPerIter);
  if (perRun < 400) perRun = 400;
  if (perRun > 5000) perRun = 5000;
  const TOTAL_SLOTS = 180000000;
  bud.left = Math.round(TOTAL_SLOTS / costPerIter);
  if (bud.left < 2000) bud.left = 2000;
  if (bud.left > 200000) bud.left = 200000;
  const iterDensity = perRun;

  const r1 = descendColoring(bestCol, bestK, 5, iterDensity);
  let cur = r1.col, curK = r1.k;
  if (useTop2) {
    const r2 = descendColoring(top2Col, top2K, 4, iterDensity);
    if (r2.k < curK) { cur = r2.col; curK = r2.k; }
  }
  const r3 = descendColoring(cur, curK, 4, iterDensity);
  if (r3.k < curK) { cur = r3.col; curK = r3.k; }

  // === G54: guaranteed-proper output net ===
  function isProper(col) {
    for (let v = 0; v < n; v++) {
      const cv = col[v];
      const al = adj[v];
      for (let i = 0; i < al.length; i++) if (col[al[i]] === cv) return false;
    }
    return true;
  }

  let out = new Int32Array(cur);
  if (!isProper(out)) {
    for (let v = 0; v < n; v++) {
      let bad = false;
      const cv = out[v];
      const al = adj[v];
      for (let i = 0; i < al.length; i++) if (out[al[i]] === cv) { bad = true; break; }
      if (bad) out[v] = firstFree(v, out);
    }
    if (!isProper(out)) {
      const g = new Int32Array(n).fill(-1);
      for (let v = 0; v < n; v++) g[v] = firstFree(v, g);
      out = g;
    }
  }

  const res = [];
  for (let v = 0; v < n; v++) res.push(out[v]);
  return res;
}