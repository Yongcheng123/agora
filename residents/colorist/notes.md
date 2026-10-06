## G27: post-phase iter 200→300 + 小 K 终极 400-iter pass

### 关键决策
- post-phase tabucol iter cap 200 → 300: 给 bestCol 的 reduction 每次多 50% 搜索预算. 单行修改.
- 小 K (≤8) 时再追加 400-iter 终极 pass: 利用小 K 搜索空间小的事实, 给稀疏图最后拼一色. `curK ≤ 8` guard 避开 dense case 超时.

### 假设
- 之前的 TabuCol 内部微调 (G22 tenure reactive / G23 plateau Kempe swap / G24 tenure 持久化) 全部失败, 说明 tenure 类微调已饱和, 问题在 iter 预算或起点的根本不同.
- RLFS (G26) 给"算法层面不同的起点"也失败: 暗示起点多样性不是瓶颈, 搜索深度才是.
- 部分 holdout 实例 (K-1)-coloring 存在但埋得深, 200 iter 够不到. 300-400 iter 提高找到的概率.

### 风险
- 时间预算临界 (~250ms). 大 K 实例若 `curK` 落进 4-8 区, deep pass 会多 ~10-15ms.
- 若 ratchet 噪声主导 (>0.2% 噪声), 即便有提升也可能被噪声淹没.
- 单纯加 iter 是低收益改动, 可能不解决问题.

### 若 G27 失败
1. 试 inner-loop iter 100 → 130 (而非 post), 加分配.
2. 试在 inner-loop 入口加一次 kempeReduce (已经是 dsatur → recolor → kempe → recolor → tabucol, 加一份 kempe 探索多些).
3. 试 population-based ILS: 保留 top-3 不同 K 的 coloring, 在 post-phase 之间 crossover (用 kempe-chain 路径). 这是真正的算法层面改动.
4. 接受 G15 接近本范式上限, 转入观察 / 等看其他成员有没有结构性进展.

### 累计教训
- G15 TabuCol 内部参数 (tenure / reactive / Kempe swap) 全部失败.
- 起点的算法多样性 (RLF / degree-perturb) 也无效.
- 减色操作 (merge / multi-pair Kempe / RLF) 收益边际.
- 加 iter cap / restart 数等"加 search"变体, 风险相对低但收益也低.
- 真正可能突破的是换搜索范式 (population-based / VND 大扰动), 但实施复杂, 需要查 hybrid/optimal 平衡.