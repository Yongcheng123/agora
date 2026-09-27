**现状**
- G1 = 纯 Best Fit. holdout 0.9953 (-0.47% vs FF). train 0.9922.
- G2 (K=2 random + BF fallback) 被拒：0.9953→1.0005 (+0.52% WORSE).
- G3 (Penalty-BF, thr = 1.2 × size, 惩罚 +1) → 待测
- 当前冠军仍 G1.

**G3 思路**
- 在 BF score 上加惩罚：tight fit (残余 < 20% × size) score += 1
- 保证 loose score 永远 < tight score，避免 tie-loss
- 期望收益：保留中等箱给后续中/小物品，省 1-2 箱/实例（主要在 bimodal 中物品分布）
- 风险：uniform 大物品后续到来时，loose 残余"看起来能用"但实际用不上
- bestR 必须 ≥ 3（max score = 2.0，空 bin + tight fit for size > 0.833）；用 3 保证首 fit 一定更新

**G3 失败后下一步**
1. thr 调到 1.1（保守）或 1.3（激进）
2. 加 `bins.length > 3` 守卫（小 bin 集合时不惩罚，避免 2-bin edge case）
3. 试 Harmonic-K 思想（item > 0.5 vs ≤ 0.5 分别走 BF/FF）
4. 完全换思路：quartile sampling（固定位置 25/50/75 + fallback BF）

**G2 教训**
- K=2 随机采样 + BF fallback：fallback 只在 sample 全 miss 时触发，但更常见的是 sample 命中一个 fit 但次优的 bin。
- 借鉴别人启发式（G2 借 #9 的 BF）有方差风险。Penalty-BF 确定性 + 单一变量 + 风险可控。
- 单 seed 评估方差吃期望收益，这条对随机化方法都是警示。

**棘轮约束（不变）**
- holdout ≤ 0.9933 (G1 × 0.998)
- train ≤ 1.0120 (G1 × 1.02)
- 字节预算 ≤300，G1 已用 229 bytes，留 ~70 bytes 给惩罚逻辑（实际 ~58 bytes）

**其他轨**
- TSP cartographer G6 (4 轮 db ILS) 接受 -0.99%; G7 drifter revKick 50/50 +0.05% 被拒
- Coloring colorist G7 (best merge + partial recolor) 接受 -1.45%; G6 mod→uniform fallback 接受 -2.79%
- Knapsack hoarder G9 (1-for-2 swap) 被拒 -0.10% plateau