function solve(items, caps) {
  const T0 = Date.now();
  const m = caps.length, n = items.length;
  const C = new Float64Array(m);
  for (let j = 0; j < m; j++) C[j] = caps[j];
  const V = new Float64Array(n);
  const W = new Float64Array(n * m);
  const WS = new Float64Array(n);
  const sc = new Float64Array(n);
  for (let i = 0; i < n; i++) {
    const w = items[i].w;
    V[i] = items[i].v;
    let t = 0;
    for (let j = 0; j < m; j++) { const x = w[j]; W[i * m + j] = x; t += x / C[j]; }
    WS[i] = t;
    sc[i] = items[i].v / (t || 1e-9);
  }
  const ord = new Array(n);
  for (let i = 0; i < n; i++) ord[i] = i;
  ord.sort(function (a, b) { return sc[b] - sc[a] || a - b; });

  const sel = new Uint8Array(n);
  const used = new Float64Array(m);
  const slack = new Float64Array(m);
  const un = new Array(n);
  let picked = [];
  let val = 0;

  function clearAll() { for (let i = 0; i < n; i++) sel[i] = 0; picked = []; val = 0; for (let j = 0; j < m; j++) { used[j] = 0; slack[j] = C[j]; } }
  function updSlack() { for (let j = 0; j < m; j++) slack[j] = C[j] - used[j]; }
  function addItem(k) { sel[k] = 1; picked.push(k); val += V[k]; const b = k * m; for (let j = 0; j < m; j++) used[j] += W[b + j]; }
  function remItem(k) {
    sel[k] = 0; val -= V[k]; const b = k * m;
    for (let j = 0; j < m; j++) used[j] -= W[b + j];
    const p = picked.indexOf(k);
    if (p >= 0) { picked[p] = picked[picked.length - 1]; picked.pop(); }
  }
  function fill(pSkip) {
    for (let t = 0; t < n; t++) {
      const i = ord[t];
      if (sel[i]) continue;
      const b = i * m;
      let ok = true;
      for (let j = 0; j < m; j++) if (W[b + j] > slack[j]) { ok = false; break; }
      if (!ok) continue;
      if (pSkip > 0 && Math.random() < pSkip) continue;
      addItem(i);
      for (let j = 0; j < m; j++) slack[j] -= W[b + j];
    }
  }
  function buildUn() {
    un.length = 0;
    for (let k = 0; k < n; k++) if (!sel[k]) un.push(k);
    un.sort(function (a, b) { return V[b] - V[a] || a - b; });
  }
  function s11(maxIter) {
    for (let it = 0; it < maxIter; it++) {
      let bd = 0, bi = -1, bk = -1;
      const p = picked.length;
      for (let a = 0; a < p; a++) {
        const i1 = picked[a], wb = i1 * m, v1 = V[i1];
        for (let k = 0; k < n; k++) {
          if (sel[k]) continue;
          const vk = V[k];
          if (vk <= v1) continue;
          const kb = k * m;
          let ok = true;
          for (let j = 0; j < m; j++) if (W[kb + j] - W[wb + j] > slack[j]) { ok = false; break; }
          if (ok) { const d = vk - v1; if (d > bd) { bd = d; bi = i1; bk = k; } }
        }
      }
      if (bi < 0) return;
      remItem(bi); addItem(bk); updSlack();
    }
  }
  function s12(maxIter) {
    for (let it = 0; it < maxIter; it++) {
      buildUn();
      const ul = un.length;
      if (ul < 2 || picked.length < 1) return;
      const vmax = V[un[0]];
      let bd = 0, bi = -1, b1 = -1, b2 = -1;
      const p = picked.length;
      for (let a = 0; a < p; a++) {
        const i1 = picked[a], wb = i1 * m, v1 = V[i1];
        if (vmax + V[un[1]] - v1 <= bd) continue;
        for (let x = 0; x < ul - 1; x++) {
          const k1 = un[x], vk1 = V[k1];
          if (vk1 + vk1 - v1 <= bd) break;
          const b1o = k1 * m;
          for (let y = x + 1; y < ul; y++) {
            const k2 = un[y];
            const d = vk1 + V[k2] - v1;
            if (d <= bd) continue;
            const b2o = k2 * m;
            let ok = true;
            for (let j = 0; j < m; j++) if (W[b1o + j] + W[b2o + j] - W[wb + j] > slack[j]) { ok = false; break; }
            if (ok) { bd = d; bi = i1; b1 = k1; b2 = k2; }
          }
        }
      }
      if (bi < 0) return;
      remItem(bi); addItem(b1); addItem(b2); updSlack();
    }
  }
  function s21(maxIter) {
    for (let it = 0; it < maxIter; it++) {
      let bd = 0, ba = -1, bb = -1, bk = -1;
      const p = picked.length;
      for (let k = 0; k < n; k++) {
        if (sel[k]) continue;
        const vk = V[k];
        if (vk <= bd) continue;
        const kb = k * m;
        for (let a = 0; a < p; a++) {
          const i1 = picked[a], w1 = i1 * m;
          for (let b = a + 1; b < p; b++) {
            const i2 = picked[b], w2 = i2 * m;
            let ok = true;
            for (let j = 0; j < m; j++) if (W[kb + j] - W[w1 + j] - W[w2 + j] > slack[j]) { ok = false; break; }
            if (ok) { const loss = V[i1] + V[i2]; const d = vk - loss; if (d > bd) { bd = d; ba = i1; bb = i2; bk = k; } }
          }
        }
      }
      if (bk < 0) return;
      remItem(ba); remItem(bb); addItem(bk); updSlack();
    }
  }
  function s22(maxIter) {
    for (let it = 0; it < maxIter; it++) {
      buildUn();
      const ul = un.length, p = picked.length;
      if (ul < 2 || p < 2) return;
      const vmax1 = V[un[0]], vmax2 = V[un[1]];
      let bd = 0, ba = -1, bb = -1, bx = -1, by = -1;
      for (let a = 0; a < p - 1; a++) {
        const i1 = picked[a], w1 = i1 * m;
        for (let b = a + 1; b < p; b++) {
          const i2 = picked[b], w2 = i2 * m, vl = V[i1] + V[i2];
          if (vmax1 + vmax2 <= vl) continue;
          for (let x = 0; x < ul - 1; x++) {
            const k1 = un[x], vk1 = V[k1], x1 = k1 * m;
            if (vk1 + vk1 <= vl) break;
            for (let y = x + 1; y < ul; y++) {
              const k2 = un[y];
              if (vk1 + V[k2] <= vl) break;
              const x2 = k2 * m;
              let ok = true;
              for (let j = 0; j < m; j++) if (W[x1 + j] + W[x2 + j] - W[w1 + j] - W[w2 + j] > slack[j]) { ok = false; break; }
              if (ok) { const d = vk1 + V[k2] - vl; if (d > bd) { bd = d; ba = i1; bb = i2; bx = k1; by = k2; } }
            }
          }
        }
      }
      if (ba < 0) return;
      remItem(ba); remItem(bb); addItem(bx); addItem(by); updSlack();
    }
  }
  function restore(smask, plist, v) {
    for (let i = 0; i < n; i++) sel[i] = smask[i];
    picked = plist.slice();
    val = v;
    for (let j = 0; j < m; j++) used[j] = 0;
    for (let t = 0; t < picked.length; t++) { const b = picked[t] * m; for (let j = 0; j < m; j++) used[j] += W[b + j]; }
    updSlack();
  }
  function save() { return [sel.slice(), picked.slice(), val]; }

  // ================= Phase 1 : G50 verbatim =================
  clearAll(); fill(0);
  s11(40); s12(3); s21(4); s22(2); s11(20); fill(0);
  let best = save();

  const RMAX = 6;
  for (let R = 0; R < RMAX; R++) {
    restore(best[0], best[1], best[2]);
    const p = picked.length;
    if (p >= 2) {
      let d = 2 + Math.floor(Math.random() * (0.25 * p));
      if (d > p - 1) d = p - 1;
      picked.sort(function (a, b) { return WS[b] - WS[a]; });
      for (let t = 0; t < d; t++) remItem(picked[t]);
      updSlack();
      fill(0.08 + 0.22 * Math.random());
    }
    s11(20); s12(2); s21(2); s22(1); s11(10);
    if (val > best[2]) best = save();
  }

  restore(best[0], best[1], best[2]);
  s11(30); s12(2); s21(2); fill(0);
  if (val > best[2]) best = save();

  // ================= Phase 2 : cheap-round LNS + ejection neighbourhood =================
  const DEAD = 780;                       // absolute ms deadline, measured from entry
  const vord = new Array(n), wsord = new Array(n);
  for (let i = 0; i < n; i++) { vord[i] = i; wsord[i] = i; }
  vord.sort(function (a, b) { return V[b] - V[a] || a - b; });
  wsord.sort(function (a, b) { return WS[b] - WS[a] || a - b; });

  function priceLambda(iters, lb) {
    const lam = new Float64Array(m);
    let sumV = 0;
    for (let i = 0; i < n; i++) sumV += V[i];
    for (let j = 0; j < m; j++) {
      let tw = 0;
      for (let i = 0; i < n; i++) tw += W[i * m + j];
      lam[j] = sumV / (tw + 1e-9);
    }
    const rv = new Float64Array(n), gg = new Float64Array(m), st = new Float64Array(m);
    let bestL = Infinity;
    const bl = new Float64Array(m);
    for (let it = 0; it < iters; it++) {
      let d = 0;
      for (let j = 0; j < m; j++) gg[j] = 0;
      for (let i = 0; i < n; i++) {
        const b = i * m;
        let rw = 0;
        for (let j = 0; j < m; j++) rw += lam[j] * W[b + j];
        rv[i] = V[i] - rw;
        if (rv[i] > 0) { d += rv[i]; for (let j = 0; j < m; j++) gg[j] += W[b + j]; }
      }
      let L = d;
      for (let j = 0; j < m; j++) L += lam[j] * C[j];
      if (L < bestL) { bestL = L; for (let j = 0; j < m; j++) bl[j] = lam[j]; }
      let nrm = 0;
      for (let j = 0; j < m; j++) {
        let gj = C[j] - gg[j];
        if (lam[j] <= 0 && gj > 0) gj = 0;
        st[j] = gj; nrm += gj * gj;
      }
      if (nrm < 1e-12) break;
      const t = 1.5 * Math.max(0, L - lb) / nrm;
      for (let j = 0; j < m; j++) lam[j] = Math.max(0, lam[j] + t * st[j]);
    }
    return bl;
  }

  const lamB = priceLambda(60, best[2]);
  const rr = new Float64Array(n), sur = new Float64Array(n);
  for (let i = 0; i < n; i++) {
    const b = i * m; let s = 0;
    for (let j = 0; j < m; j++) s += lamB[j] * W[b + j];
    sur[i] = s; rr[i] = V[i] - s;
  }
  const ordSur = new Array(n), ordLP = new Array(n);
  for (let i = 0; i < n; i++) { ordSur[i] = i; ordLP[i] = i; }
  ordSur.sort(function (a, b) {
    const da = rr[a] / (sur[a] > 1e-9 ? sur[a] : 1e-9);
    const db = rr[b] / (sur[b] > 1e-9 ? sur[b] : 1e-9);
    return db - da;
  });
  ordLP.sort(function (a, b) { return rr[b] - rr[a]; });

  const need = new Float64Array(m);
  const poolI = new Int32Array(n + 4);
  const poolE = new Float64Array(n + 4);
  let bk = -1, b1 = -1, b2 = -1, b3 = -1, bgain = 0;

  function rebuildUn2() {
    un.length = 0;
    for (let t = 0; t < n; t++) { const i = vord[t]; if (!sel[i]) un.push(i); }
  }

  function addFit() {
    const ul = un.length;
    for (let t = 0; t < ul; t++) {
      const i = un[t];
      if (sel[i]) continue;
      const b = i * m;
      let ok = true;
      for (let j = 0; j < m; j++) if (W[b + j] > slack[j]) { ok = false; break; }
      if (!ok) continue;
      addItem(i);
      for (let j = 0; j < m; j++) slack[j] -= W[b + j];
    }
  }

  function ejectBest(candLimit) {
    bk = -1; b1 = -1; b2 = -1; b3 = -1; bgain = 0;
    const ul = un.length;
    const pl = picked.length;
    for (let t = 0; t < ul && t < candLimit; t++) {
      const k = un[t];
      if (V[k] <= bgain) break;
      const kb = k * m;
      let anyDef = false;
      for (let j = 0; j < m; j++) { const nd = W[kb + j] - slack[j]; need[j] = nd; if (nd > 0) anyDef = true; }
      if (!anyDef) { bgain = V[k]; bk = k; break; }
      let Q = 0, mcI = -1, mcC = 0;
      for (let a = 0; a < pl; a++) {
        const i = picked[a], ib = i * m;
        let cov = 0;
        for (let j = 0; j < m; j++) { const nd = need[j]; if (nd > 0) { const wv = W[ib + j]; cov += wv < nd ? wv : nd; } }
        if (cov <= 0) continue;
        if (cov > mcC) { mcC = cov; mcI = i; }
        const e = cov / V[i];
        if (Q < 10) {
          let q = Q++;
          while (q > 0 && poolE[q - 1] < e) { poolE[q] = poolE[q - 1]; poolI[q] = poolI[q - 1]; q--; }
          poolE[q] = e; poolI[q] = i;
        } else if (e > poolE[9]) {
          let q = 9;
          while (q > 0 && poolE[q - 1] < e) { poolE[q] = poolE[q - 1]; poolI[q] = poolI[q - 1]; q--; }
          poolE[q] = e; poolI[q] = i;
        }
      }
      if (Q === 0) continue;
      if (mcI >= 0 && Q < 12) {
        let has = false;
        for (let q = 0; q < Q; q++) if (poolI[q] === mcI) { has = true; break; }
        if (!has) { poolI[Q] = mcI; poolE[Q] = 0; Q++; }
      }
      for (let a = 0; a < Q; a++) {
        const i1 = poolI[a], o1 = i1 * m, v1 = V[i1];
        if (v1 < V[k] - bgain) {
          let ok = true;
          for (let j = 0; j < m; j++) { const nd = need[j]; if (nd > 0 && W[o1 + j] < nd) { ok = false; break; } }
          if (ok) { bgain = V[k] - v1; bk = k; b1 = i1; b2 = -1; b3 = -1; }
        }
        for (let b = a + 1; b < Q; b++) {
          const i2 = poolI[b], o2 = i2 * m, v2 = V[i2];
          const l2 = v1 + v2;
          if (l2 < V[k] - bgain) {
            let ok = true;
            for (let j = 0; j < m; j++) { const nd = need[j]; if (nd > 0 && W[o1 + j] + W[o2 + j] < nd) { ok = false; break; } }
            if (ok) { bgain = V[k] - l2; bk = k; b1 = i1; b2 = i2; b3 = -1; }
          }
          for (let c = b + 1; c < Q; c++) {
            const i3 = poolI[c], o3 = i3 * m, v3 = V[i3];
            const l3 = l2 + v3;
            if (l3 < V[k] - bgain) {
              let ok = true;
              for (let j = 0; j < m; j++) { const nd = need[j]; if (nd > 0 && W[o1 + j] + W[o2 + j] + W[o3 + j] < nd) { ok = false; break; } }
              if (ok) { bgain = V[k] - l3; bk = k; b1 = i1; b2 = i2; b3 = i3; }
            }
          }
        }
      }
    }
  }

  function applyEject() {
    if (bk < 0) return false;
    if (b1 >= 0) remItem(b1);
    if (b2 >= 0) remItem(b2);
    if (b3 >= 0) remItem(b3);
    addItem(bk);
    updSlack();
    return true;
  }

  function ruin() {
    const p = picked.length;
    if (p === 0) return;
    let R = 1 + ((Math.random() * 8) | 0);
    if (R > p) R = p;
    const mode = Math.random();
    if (mode < 0.42) {
      let cnt = 0;
      for (let t = 0; t < n && cnt < R; t++) {
        const i = wsord[t];
        if (sel[i]) { remItem(i); cnt++; }
      }
    } else if (mode < 0.75) {
      for (let r = 0; r < R; r++) {
        const p2 = picked.length;
        if (p2 === 0) break;
        remItem(picked[(Math.random() * p2) | 0]);
      }
    } else {
      let cnt = 0;
      for (let t = n - 1; t >= 0 && cnt < R; t--) {
        const i = vord[t];
        if (sel[i]) { remItem(i); cnt++; }
      }
    }
    updSlack();
  }

  function fillOrd(order, pSkip) {
    for (let t = 0; t < n; t++) {
      const i = order[t];
      if (sel[i]) continue;
      const b = i * m;
      let ok = true;
      for (let j = 0; j < m; j++) if (W[b + j] > slack[j]) { ok = false; break; }
      if (!ok) continue;
      if (pSkip > 0 && Math.random() < pSkip) continue;
      addItem(i);
      for (let j = 0; j < m; j++) slack[j] -= W[b + j];
    }
  }

  function recreate() {
    const r0 = Math.random();
    const o = r0 < 0.45 ? ordSur : (r0 < 0.78 ? ord : ordLP);
    fillOrd(o, Math.random() * 0.12);
  }

  restore(best[0], best[1], best[2]);
  let curS = sel.slice(), curP = picked.slice(), curV = val;
  let bestS = best[0].slice(), bestP = best[1].slice(), bestV = best[2];
  let stall = 0;
  while (Date.now() - T0 < DEAD) {
    ruin();
    recreate();
    rebuildUn2(); addFit();
    for (let t = 0; t < 2; t++) {
      rebuildUn2();
      ejectBest(14);
      if (!applyEject()) break;
      rebuildUn2(); addFit();
    }
    if (val >= curV) {
      curV = val; curS = sel.slice(); curP = picked.slice();
      if (val > bestV) { bestV = val; bestS = sel.slice(); bestP = picked.slice(); stall = 0; }
      else stall++;
    } else {
      restore(curS, curP, curV);
      stall++;
    }
    if (stall > 400) {
      restore(bestS, bestP, bestV);
      curS = sel.slice(); curP = picked.slice(); curV = bestV; stall = 0;
    }
  }

  if (Date.now() - T0 < 800) {
    restore(bestS, bestP, bestV);
    s11(20); s12(1); s21(1); fill(0);
    if (val > bestV) { bestV = val; bestS = sel.slice(); bestP = picked.slice(); }
  }

  let out = bestP;
  if (out.length === 0) {
    let bi = -1, bv = -1;
    for (let i = 0; i < n; i++) {
      const b = i * m; let ok = true;
      for (let j = 0; j < m; j++) if (W[b + j] > C[j]) { ok = false; break; }
      if (ok && V[i] > bv) { bv = V[i]; bi = i; }
    }
    if (bi >= 0) out = [bi];
  }
  return out.slice().sort(function (a, b) { return a - b; });
}