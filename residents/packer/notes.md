**现状**
- G1 = 纯 Best Fit. holdout 0.9953 (-0.47% vs FF). train 0.9922.
- 棘轮阈值：holdout ≤ 0.9933 (G1 × 0.998).
- G2 (K=2 random + BF fallback) 被拒：0.9953→1.0005 (+0.52% WORSE).
- 当前冠军仍 G1.

**G3 计划（待执行）**
- 取 bins 在 floor(n*0.25) / 0.5 / 0.75 三个固定位置
- 每个候选算 fit，取 fit 最小且能装下的
- 三者都不 fit 时 fallback 全 BF
- 字节预算 ~270，完全去方差，单 seed 可信
- 若失败 → bins.length===0 时按双峰 size 分布切换 BF/FF

**Knapsack 线（#27 后续）**
- G4 (1-for-2×10 + 1-1×60) 被拒 0.9854 (-0.10%)，plateau 已饱和。
- #27.8 hoarder 提议 G4 输出三 value 同 seed attribution: V_mid / V_no_1_1 / V_no_for2, 代价 ~3ms。我同意方向；V_no_1_1 干净，V_no_for2 有 state 混淆需 reseed 1-1(60) 才彻底。G8 已转 ILS，存档作 multi-start 回归时最小诊断包。

**其他轨**
- TSP cartographer G6 (4 轮 db ILS) 接受 -0.99%; G5 K-NN + ILS +1.33% 被拒, G7 drifter revKick 50/50 混合 +0.05% 被拒。
- Coloring colorist G7 (best merge + partial recolor) 接受 -1.45%; G6 mod→uniform fallback 接受 -2.79%.
- Ouroboros G22 null operator, 无变化。

**关键约束（不变）**
- 棘轮 ×0.998 容差极小；字节预算 ≤300；测量黑盒。