function solve(items, caps) {
  const m = caps.length;
  const n = items.length;

  const eff = new Array(n);
  for (let i = 0; i < n; i++) {
    let s = 0;
    for (let j = 0; j < m; j++) s += items[i].w[j] / caps[j];
    eff[i] = [items[i].v / (s || 1e-9), i];
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
    const pLen = pickedArr.length;
    for (let pi = 0; pi < pLen; pi++) {
      const i = pickedArr[pi];
      const wi = items[i].w;
      const vi = items[i].v;
      for (let k = 0; k < n; k++) {
        if (picked.has(k)) continue;
        const vk = items[k].v;
        if (vk <= vi) continue;
        const wk = items[k].w;
        let fits = true;
        for (let j = 0; j < m; j++) {
          if (used[j] - wi[j] + wk[j] > caps[j]) { fits = false; break; }
        }
        if (fits) {
          const d = vk - vi;
          if (d > bd) { bd = d; bi = i; bk = k; }
        }
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
      const vk = items[k].v;
      if (vk <= bd) continue;
      const wk = items[k].w;
      for (let a = 0; a < pLen; a++) {
        for (let b = a + 1; b < pLen; b++) {
          const i1 = pickedArr[a], i2 = pickedArr[b];
          const wi1 = items[i1].w, wi2 = items[i2].w;
          let fits = true;
          for (let j = 0; j < m; j++) {
            if (used[j] - wi1[j] - wi2[j] + wk[j] > caps[j]) { fits = false; break; }
          }
          if (fits) {
            const loss = items[i1].v + items[i2].v;
            if (loss < vk) {
              const d = vk - loss;
              if (d > bd) { bd = d; bi1 = i1; bi2 = i2; bk = k; }
            }
          }
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

  for (let iter = 0; iter < 3; iter++) {
    const unpickedByV = [];
    for (let k = 0; k < n; k++) {
      if (!picked.has(k)) unpickedByV.push([items[k].v, k]);
    }
    unpickedByV.sort((a, b) => b[0] - a[0]);

    let bd = 0, bi1 = -1, bi2 = -1, bk1 = -1, bk2 = -1;
    const pLen = pickedArr.length;
    const uLen = unpickedByV.length;
    const maxUn = uLen >= 1 ? unpickedByV[0][0] : 0;
    const secUn = uLen >= 2 ? unpickedByV[1][0] : 0;

    for (let a = 0; a < pLen - 1; a++) {
      for (let b = a + 1; b < pLen; b++) {
        const i1 = pickedArr[a], i2 = pickedArr[b];
        const wi1 = items[i1].w, wi2 = items[i2].w;
        const vLoss = items[i1].v + items[i2].v;

        if (maxUn + secUn <= vLoss) continue;

        for (let x = 0; x < uLen - 1; x++) {
          const v1 = unpickedByV[x][0];
          if (v1 + v1 <= vLoss) break;
          const k1 = unpickedByV[x][1];
          const wk1 = items[k1].w;
          for (let y = x + 1; y < uLen; y++) {
            const v2 = unpickedByV[y][0];
            if (v1 + v2 <= vLoss) break;
            const k2 = unpickedByV[y][1];
            const wk2 = items[k2].w;

            let fits = true;
            for (let j = 0; j < m; j++) {
              if (used[j] - wi1[j] - wi2[j] + wk1[j] + wk2[j] > caps[j]) {
                fits = false;
                break;
              }
            }
            if (fits) {
              const d = v1 + v2 - vLoss;
              if (d > bd) { bd = d; bi1 = i1; bi2 = i2; bk1 = k1; bk2 = k2; }
            }
          }
        }
      }
    }

    if (bi1 < 0) break;

    const wi1 = items[bi1].w, wi2 = items[bi2].w;
    const wk1 = items[bk1].w, wk2 = items[bk2].w;
    picked.delete(bi1);
    picked.delete(bi2);
    picked.add(bk1);
    picked.add(bk2);
    for (let j = 0; j < m; j++) {
      used[j] = used[j] - wi1[j] - wi2[j] + wk1[j] + wk2[j];
    }
    pickedArr = pickedArr.filter(x => x !== bi1 && x !== bi2);
    pickedArr.push(bk1);
    pickedArr.push(bk2);
  }

  for (let iter = 0; iter < 20; iter++) {
    let bd = 0, bi = -1, bk = -1;
    const pLen = pickedArr.length;
    for (let pi = 0; pi < pLen; pi++) {
      const i = pickedArr[pi];
      const wi = items[i].w;
      const vi = items[i].v;
      for (let k = 0; k < n; k++) {
        if (picked.has(k)) continue;
        const vk = items[k].v;
        if (vk <= vi) continue;
        const wk = items[k].w;
        let fits = true;
        for (let j = 0; j < m; j++) {
          if (used[j] - wi[j] + wk[j] > caps[j]) { fits = false; break; }
        }
        if (fits) {
          const d = vk - vi;
          if (d > bd) { bd = d; bi = i; bk = k; }
        }
      }
    }
    if (bi < 0) break;
    const wi = items[bi].w, wk = items[bk].w;
    picked.delete(bi);
    picked.add(bk);
    for (let j = 0; j < m; j++) used[j] = used[j] - wi[j] + wk[j];
    pickedArr[pickedArr.indexOf(bi)] = bk;
  }

  const rem = [];
  for (let k = 0; k < n; k++) {
    if (picked.has(k)) continue;
    let s = 0;
    for (let j = 0; j < m; j++) s += items[k].w[j] / caps[j];
    rem.push([items[k].v / (s || 1e-9), k]);
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