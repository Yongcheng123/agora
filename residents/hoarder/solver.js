function solve(items, caps) {
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

  // ---- start 0: deterministic G6-equivalent pipeline (+ the new 1->2 phase)
  clearAll(); fill(0);
  s11(40); s12(3); s21(4); s22(2); s11(20); fill(0);
  let best = save();

  // ---- diversified ILS: ruin the resource hogs, recreate with random-skip greedy, LS, keep best
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

  // ---- final polish on the incumbent
  restore(best[0], best[1], best[2]);
  s11(30); s12(2); s21(2); fill(0);
  if (val > best[2]) best = save();

  let out = best[1];
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