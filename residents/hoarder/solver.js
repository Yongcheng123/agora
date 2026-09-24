function solve(items, caps) {
  const m = caps.length;
  const n = items.length;

  const eff = new Array(n);
  for (let i = 0; i < n; i++) {
    let w = 0;
    for (let j = 0; j < m; j++) w += items[i].w[j] / caps[j];
    eff[i] = [items[i].v / (w || 1e-9), i];
  }
  eff.sort((a, b) => b[0] - a[0] || a[1] - b[1]);

  const used = new Array(m).fill(0);
  const picked = new Set();
  let pickedArr = [];

  for (let idx = 0; idx < n; idx++) {
    const i = eff[idx][1];
    const w = items[i].w;
    let fits = true;
    for (let j = 0; j < m; j++) {
      if (used[j] + w[j] > caps[j]) { fits = false; break; }
    }
    if (!fits) continue;
    for (let j = 0; j < m; j++) used[j] += w[j];
    picked.add(i);
    pickedArr.push(i);
  }

  for (let iter = 0; iter < 80; iter++) {
    let bd = 0, bi = -1, bk = -1;
    for (let pi = 0; pi < pickedArr.length; pi++) {
      const i = pickedArr[pi];
      const wi = items[i].w;
      const vi = items[i].v;
      for (let k = 0; k < n; k++) {
        if (picked.has(k)) continue;
        const wk = items[k].w;
        const vk = items[k].v;
        if (vk <= vi) continue;
        let fits = true;
        for (let j = 0; j < m; j++) {
          if (used[j] - wi[j] + wk[j] > caps[j]) { fits = false; break; }
        }
        if (!fits) continue;
        const d = vk - vi;
        if (d > bd) { bd = d; bi = i; bk = k; }
      }
    }
    if (bi < 0) break;
    const wi = items[bi].w, wk = items[bk].w;
    picked.delete(bi);
    picked.add(bk);
    for (let j = 0; j < m; j++) used[j] = used[j] - wi[j] + wk[j];
    pickedArr[pickedArr.indexOf(bi)] = bk;
  }

  for (let iter = 0; iter < 8; iter++) {
    let bd = 0, bi1 = -1, bi2 = -1, bk = -1;
    const pLen = pickedArr.length;
    for (let k = 0; k < n; k++) {
      if (picked.has(k)) continue;
      const wk = items[k].w;
      const vk = items[k].v;
      if (vk <= bd) continue;
      for (let a = 0; a < pLen; a++) {
        for (let b = a + 1; b < pLen; b++) {
          const i1 = pickedArr[a], i2 = pickedArr[b];
          const wi1 = items[i1].w, wi2 = items[i2].w;
          let fits = true;
          for (let j = 0; j < m; j++) {
            if (used[j] - wi1[j] - wi2[j] + wk[j] > caps[j]) { fits = false; break; }
          }
          if (!fits) continue;
          const loss = items[i1].v + items[i2].v;
          if (loss >= vk) continue;
          const d = vk - loss;
          if (d > bd) { bd = d; bi1 = i1; bi2 = i2; bk = k; }
        }
      }
    }
    if (bi1 < 0) break;
    const wi1 = items[bi1].w, wi2 = items[bi2].w, wk = items[bk].w;
    picked.delete(bi1);
    picked.delete(bi2);
    picked.add(bk);
    for (let j = 0; j < m; j++) used[j] = used[j] - wi1[j] - wi2[j] + wk[j];
    pickedArr = pickedArr.filter(x => x !== bi1 && x !== bi2);
    pickedArr.push(bk);
  }

  const rem = [];
  for (let k = 0; k < n; k++) {
    if (picked.has(k)) continue;
    let w = 0;
    for (let j = 0; j < m; j++) w += items[k].w[j] / caps[j];
    rem.push([items[k].v / (w || 1e-9), k]);
  }
  rem.sort((a, b) => b[0] - a[0]);
  for (const [, k] of rem) {
    const wk = items[k].w;
    let fits = true;
    for (let j = 0; j < m; j++) {
      if (used[j] + wk[j] > caps[j]) { fits = false; break; }
    }
    if (fits) {
      picked.add(k);
      pickedArr.push(k);
      for (let j = 0; j < m; j++) used[j] += wk[j];
    }
  }

  return pickedArr.slice().sort((a, b) => a - b);
}