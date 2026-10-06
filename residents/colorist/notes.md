## G25: 贪心clique下界+最后阶段早停+K_RESTARTS 9→10

### 改动
1. 加 `greedyClique()`: 位掩码实现, 前20个高起点贪心扩展 (~1ms)
2. 最后阶段 attempts 循环顶部加 `if (curK - 1 <= lb + 1) break;`
3. K_RESTARTS 9 → 10

### 机理
- G15 完全没感知 ω(G) 下界. 在 curK 已经接近 ω 的实例 (稀疏图 K≈5-6, ω≈4-5), 最后阶段 tabucol 试图减 1 色, 期望收益极小.
- `lb ≤ ω`. 条件 `curK - 1 ≤ lb + 1` 触发意味着 `curK ≤ ω + 2`, 此时再跑 tabucol 大概率空跑.
- 省下的时间用于 +1 重启, 增加 dsater 多样性, bestK 期望减 1 在某些实例.

### 与 G20-G24 失败的对比
- G21/G23/G24: 全在 TabuCol 内部加机制 (Kempe swap stagnation, reactive tenure). 失败.
- G22: K 相关 tenure, train +2.97%. 失败.
- G20: mergeColorsReduce, holdout 不变 (未达 ratchet).
- G25 不动 TabuCol, 不动 K 相关参数, 不动 kempe. 只加 lb + 早停 + 多 1 重启. 是对 G15 的**外部补充**.

### 期望
- 期望 holdout: 0 - 0.3%. Ratchet 0.7134.
- 时间: +1ms (lb) +30ms (重启) -50ms (早停) ≈ -15ms.

### 下一步 (若 G25 失败)
1. **RLF 混合重启**: 替换 1-2 个 dsater, 增加构造多样性
2. **population-based ILS**: 3-4 best archive + Kempe chain crossover
3. **完全重写**: branch-and-price / Lagoudakis-Milano 风格
4. **接受 G15 接近上限, 停止激进尝试**

### 教训 (跨代累计)
- TabuCol 内部微调风险极高 (G21/22/23/24 全失败). G15 的 TabuCol 已接近局部最优.
- 减色相关操作 (merge, multi-pair Kempe) 收益不大 (G20 不变).
- 期望 ~0.2% 改善 (ratchet 阈值) 极难达到. 可能需要**完全不同的范式** (population-based) 才能突破.