# drifter G8

## G8 单变量 (locked, 2026-09-27)
G4 + ILS 迭代 8→12 + final or-opt 3→5。
其它全部不动：dist 矩阵、NN、2-opt (DLB)、or-opt-1、init 起点 (0, far)、db kick 结构与切点分布全部保留。

## 设计选择 (locked)
- 延续 G4-G7 路线，只做 depth 加法，不引入新 kick 或新邻域。
- 制图师 G6 (0.8176) 用少轮深搜 (4 轮 runLS(10,3))，我 G4 用多轮浅搜 (8 轮 db+2-opt(5)+or-opt(1))。后者赢 -0.16%。
- 推断再多 4 轮 ILS 应该再多覆盖几个 holdout 盆地。
- final 5 轮 or-opt 是边际 refine。

## 时间预算
- 12 × (5+1) + init 46 + final 5 = 123 passes of O(n²) ≈ 500-600ms。
- 在 250ms 推荐之上但在 1000ms cap 内。
- ~5% 超时风险（cluster 数据 + Float64Array 边界常数）。

## 假设与预期
- EV -0.15%~-0.30% holdout。
- 主要杠杆 ILS 8→12 (~60% 贡献)。
- final 加深 (~40% 贡献)。
- 通过棘轮 (-0.21%) 概率 ~40-50%。

## 失败后退 (G9 候选)
- 选项 a：or-opt-2 ONLY in final（G5 全局失败但仅 final 可能通过，估 -0.05%~-0.10%）。
- 选项 b：3-opt with K=12 pruning in final only（~30ms，新邻域，估 -0.20%~-0.40% 但实现复杂有 bug 风险）。
- 选项 c：SA 路径——median T0 probe + 200 iter segment-reverse SA after G4 ILS（drifter soul 一致，但需 T0 标定）。
- 选项 d：接受 G4 champion，等下一轮 inspiration（cartographer/调色师那边的进展）。

## 累积 lessons (G3-G8)
- G3：SA + or-opt 双变量被拒（ratchet +0.67%），T0 未标定是主因。
- G4：单变量加 or-opt-1 成功（-1.24%），ILS kick 池不变。
- G5：加 or-opt-2 全局失败（+0.31%），2 段重定位在 n≈200 EUC TSP 信号弱。
- G6：FPS-4 起点失败（-0.07%），多起点已达饱和。
- G7：revKick 多样性失败（+0.05%），弱 kick 比 db 拖后腿。
- G8 (in flight)：加深 LS 路线。

## 单变量纪律
G8 仍是 "加深" 路线，不引入新 kick 类型或新邻域。
若 G8 失败，回退路径是 or-opt-2 only-final 或 3-opt K-pruned，不回到 kick 多样性或起点多样性——这些方向已被 G6/G7 否定。