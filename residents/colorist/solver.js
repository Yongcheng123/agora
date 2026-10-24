function solve(n, edges) {
  const T0 = Date.now();
  const DEADLINE = T0 + 600;
  const NB = n + 1;

  const adj = new Array(n);
  for (let i = 0; i < n; i++) adj[i] = [];
  for (let i = 0; i < edges.length; i++) {
    const u = edges[i][0], v = edges[i][1];
    adj[u].push(v);
    adj[v].push(u);
  }
  const deg = new Int32Array(n);
  for (let v = 0; v < n; v++) deg[v] = adj[v].length;

  // fast deterministic PRNG (xorshift32) - Math.random in the inner loop is hot
  let rs = (0x9E3779B9 ^ Math.imul(n + 1, 0x85EBCA6B)) | 0;
  if (rs === 0) rs = 0x1BADB002;
  function rnd() {
    rs ^= rs << 13; rs |= 0;
    rs ^= rs >>> 17;
    rs ^= rs << 5; rs |= 0;
    return (rs >>> 0) * 2.3283064365386963e-10;
  }

  const usedArr = new Int32Array(n + 2);
  let ustm = 0;
  // smallest colour <= limit not used by any neighbour; never create a colour above limit
  function firstFree(v, col, limit) {
    ustm++;
    const al = adj[v];
    for (let i = 0; i < al.length; i++) {
      const cu = col[al[i]];
      if (cu >= 0) usedArr[cu] = ustm;
    }
    let c = 0;
    while (c <= limit && usedArr[c] === ustm) c++;
    return c <= limit ? c : col[v];
  }

  function numColors(col) {
    let mx = 0;
    for (let v = 0; v < n; v++) if (col[v] > mx) mx = col[v];
    return mx + 1;
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

  // renumber to 0..k-1 in order of first appearance; returns number of distinct colours
  function compact(col) {
    const map = new Int32Array(NB).fill(-1);
    let k = 0;
    for (let v = 0; v < n; v++) {
      const c = col[v];
      if (map[c] < 0) map[c] = k++;
      col[v] = map[c];
    }
    return k;
  }

  // rule 0: TRUE saturation degree (distinct colours among coloured neighbours) - Brélaz DSatur
  // rule 1: number of coloured neighbours (the G54 rule) - kept as a pool diversity variant
  function dsatur(rule, randomTies) {
    const col = new Int32Array(n).fill(-1);
    const sat = new Int32Array(n);
    const cn = new Int32Array(n);
    const has = new Uint8Array(n * NB);      // has[u*NB+c] = u has a coloured neighbour of colour c
    const inRem = new Uint8Array(n).fill(1);
    for (let step = 0; step < n; step++) {
      let b = -1, bk = -1;
      for (let v = 0; v < n; v++) {
        if (!inRem[v]) continue;
        const p = rule === 0 ? sat[v] : cn[v];
        const key = p * NB + deg[v];
        if (key > bk) { bk = key; b = v; }
      }
      if (randomTies) {
        let cnt = 0, pick = -1;
        for (let v = 0; v < n; v++) {
          if (!inRem[v]) continue;
          const p = rule === 0 ? sat[v] : cn[v];
          const key = p * NB + deg[v];
          if (key === bk) { cnt++; if (rnd() * cnt < 1) pick = v; }
        }
        if (pick >= 0) b = pick;
      }
      const al = adj[b];
      const base = b * NB;
      for (let i = 0; i < al.length; i++) {
        const cu = col[al[i]];
        if (cu >= 0) has[base + cu] = 1;
      }
      let c = 0;
      while (has[base + c]) c++;
      col[b] = c;
      inRem[b] = 0;
      for (let i = 0; i < al.length; i++) {
        const u = al[i];
        if (inRem[u]) {
          cn[u]++;
          if (!has[u * NB + c]) { has[u * NB + c] = 1; sat[u]++; }
        }
      }
    }
    return col;
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
          for (let i = 0; i < comp.length; i++) {
            const v = comp[i];
            trial[v] = work[v] === cMax ? cOther : cMax;
          }
          for (let i = 0; i < comp.length; i++) {
            const v = comp[i];
            trial[v] = firstFree(v, trial, cMax);
          }
          let cMaxUsed = false;
          for (let v = 0; v < n; v++) if (trial[v] === cMax) { cMaxUsed = true; break; }
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
      const c = (rnd() * K) | 0;
      if (c !== cA && clsSize[c] > 0) { cB = c; break; }
    }
    if (cB < 0) return;
    let start = -1, startDeg = -1, ties = 0;
    for (let v = 0; v < n; v++) {
      if (work[v] === cA) {
        const d = deg[v];
        if (d > startDeg) { startDeg = d; ties = 1; start = v; }
        else if (d === startDeg) { ties++; if (rnd() * ties < 1) start = v; }
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

  // TabuCol (Hertz/de Werra style): K colours, minimise conflicts.
  // Runs until a conflict-free colouring is found, maxIter is hit, or the wall clock passes deadline.
  function tabucolRun(work, K, maxIter, deadline) {
    if (K < 2) return null;
    const nK = n * K;
    const adjCC = new Int32Array(nK);
    const conflicts = new Int32Array(n);
    const tabu = new Int32Array(nK);
    const freq = new Int32Array(nK);
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
            bestDelta = delta; bestV = v; bestC = c; ties = 1;
          } else if (delta === bestDelta) {
            ties++;
            const curF = freq[v * K + c];
            const bestF = freq[bestV * K + bestC];
            if (curF < bestF) { bestV = v; bestC = c; }
            else if (curF === bestF && rnd() * ties < 1) { bestV = v; bestC = c; }
          }
        }
      }
      if (bestV < 0) break;
      const v = bestV;
      const cOld = work[v];
      const cNew = bestC;
      work[v] = cNew;
      const tenure = tenureBase + ((rnd() * tenureBase) | 0);
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
      if ((iter & 31) === 31) {
        if (Date.now() > deadline) break;
      }
      if ((iter & 63) === 63) {
        for (let i = 0; i < freq.length; i++) freq[i] >>= 2;
      }
    }
    return bestConflicts === 0 ? bestWork : null;
  }

  // map a colouring with more than K colours into K classes, overflow into the class
  // with the fewest incident edges
  function mapTo(col, K) {
    const ec = new Int32Array(K);
    for (let v = 0; v < n; v++) {
      if (col[v] >= K) {
        const al = adj[v];
        for (let i = 0; i < al.length; i++) if (col[al[i]] < K) ec[col[al[i]]]++;
      }
    }
    let bestI = 0;
    for (let i = 1; i < K; i++) if (ec[i] < ec[bestI]) bestI = i;
    const out = new Int32Array(n);
    for (let v = 0; v < n; v++) out[v] = col[v] >= K ? bestI : col[v];
    return out;
  }

  // diverse starting points for the K-colour search
  function buildStart(base, K, kind, round) {
    const work = new Int32Array(base);
    if (kind === 1) {
      for (let v = 0; v < n; v++) work[v] = (rnd() * K) | 0;
      return work;
    }
    if (kind === 2) {
      const cf = new Int32Array(n);
      for (let v = 0; v < n; v++) {
        const al = adj[v];
        let c = 0;
        for (let i = 0; i < al.length; i++) if (work[al[i]] === work[v]) c++;
        cf[v] = c;
      }
      const ids = new Int32Array(n);
      for (let v = 0; v < n; v++) ids[v] = v;
      ids.sort((a, b) => cf[b] - cf[a]);
      const NK = Math.max(5, Math.floor(n / 15));
      for (let i = 0; i < NK && i < n; i++) work[ids[i]] = (rnd() * K) | 0;
      return work;
    }
    if (kind === 3) {
      const NK = Math.max(3, Math.floor(n / 30));
      for (let i = 0; i < NK && i < n; i++) {
        const v = (rnd() * n) | 0;
        work[v] = (rnd() * K) | 0;
      }
      return work;
    }
    if (kind === 4) {
      kempePerturb(work, K);
      if (round > 0) kempePerturb(work, K);
      return work;
    }
    // kind 0: the mapped colouring itself; on later rounds add a light kick so it is not a verbatim repeat
    if (round > 0) {
      const NK = Math.max(2, Math.floor(n / 50));
      for (let i = 0; i < NK && i < n; i++) {
        const v = (rnd() * n) | 0;
        work[v] = (rnd() * K) | 0;
      }
    }
    return work;
  }

  // ---------------- restart pool: DSatur (two rules) + Kempe reduction ----------------
  const pool = [];
  const R = 9;
  for (let k = 0; k < R; k++) {
    const rule = k < 5 ? 0 : 1;
    const rand = k !== 0;
    const col = dsatur(rule, rand);
    recolorFixed(col);
    kempeReduce(col);
    recolorFixed(col);
    const kk = compact(col);
    pool.push({ col: col, k: kk });
  }
  pool.sort((a, b) => a.k - b.k);

  // ---------------- descent: give the whole remaining budget to the most promising level ----
  let cur = pool[0].col;
  let curK = pool[0].k;
  const W = [0.34, 0.18, 0.14, 0.12, 0.10, 0.06, 0.03, 0.03];
  const MAX_ITER = 1 << 28;

  while (curK > 2) {
    const T = curK - 1;
    const levelStart = Date.now();
    const cands = [];
    for (let i = 0; i < pool.length; i++) if (pool[i].k > T) cands.push(pool[i]);
    if (cands.length === 0) break;
    cands.sort((a, b) => a.k - b.k);
    const bases = [];
    for (let i = 0; i < cands.length; i++) bases.push(mapTo(cands[i].col, T));
    let found = null;
    let trialIdx = 0;
    let round = 0;
    while (!found) {
      if (DEADLINE - Date.now() <= 0) break;
      for (let ci = 0; ci < cands.length && !found; ci++) {
        for (let s = 0; s < 5 && !found; s++) {
          const tnow = Date.now();
          const trem = DEADLINE - tnow;
          if (trem <= 0) break;
          const w = W[trialIdx % W.length];
          trialIdx++;
          const slice = Math.min(trem, Math.max(1, Math.floor((DEADLINE - levelStart) * w)));
          const work = buildStart(bases[ci], T, s, round);
          const r = tabucolRun(work, T, MAX_ITER, tnow + slice);
          if (r) { found = r; break; }
        }
      }
      round++;
    }
    if (!found) break;
    recolorFixed(found);
    const nk = compact(found);
    if (nk >= curK) break;
    cur = found;
    curK = nk;
    pool.unshift({ col: new Int32Array(found), k: nk });
  }

  // ---------------- final validation + fallbacks ----------------
  let finalCol = cur;
  let ok = true;
  for (let i = 0; i < edges.length; i++) {
    const u = edges[i][0], v = edges[i][1];
    if (finalCol[u] === finalCol[v]) { ok = false; break; }
  }
  if (!ok) {
    finalCol = dsatur(0, false);
    ok = true;
    for (let i = 0; i < edges.length; i++) {
      const u = edges[i][0], v = edges[i][1];
      if (finalCol[u] === finalCol[v]) { ok = false; break; }
    }
    if (!ok) for (let v = 0; v < n; v++) finalCol[v] = v;
  }
  compact(finalCol);
  const out = new Array(n);
  for (let v = 0; v < n; v++) out[v] = finalCol[v];
  return out;
}
