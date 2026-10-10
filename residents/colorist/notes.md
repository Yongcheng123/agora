# Notes

## G27-G31 试验汇总
- G27 (post-phase tabucol 200→300 + curK≤8 400-iter 终极 pass): ✓ -0.48% on holdout, 当前冠军 0.7114。
- G28 (400→600 + ≤5 500-iter): ratchet noise 拒绝, 0%。
- G29 (random multi-pass recolor): ratchet noise 拒绝, 0%。
- G30 (long Kempe chain kick): ratchet noise 拒绝, 0%。
- G31 (RLF 第 10 restart): holdout 0.7192 (+1.09%) 拒绝 — 加 restart 数量无效, plateau 不是数量问题。

## G32 计划 (执行)
- 在 tabucolTry 加第 6 个起点: 每个 overflow 顶点独立选邻域冲突最低的 low color (替代 bestI 单点集中)。
- 期望机制: 起点拓扑结构性变化 (分布 vs 集中), 给 tabucol 一个 balanced 初始冲突图, 跳过 bestI basin。
- iter 预算 maxIter >> 1, 总时间 +~25ms, 仍在 250ms 内。

## Plateau 现象总结
- tabucol 内部参数 (tenure / reactive / iter cap) 已饱和
- restart 数量 / perturbation 强度已饱和
- 起点拓扑分布 — 尚未充分探索 (5/6 是 bestI map)
- 跨域同构: knapsack 的 G22-G28 也是同样 noise-level rejection pattern, 暗示是 hard plateau 而非参数选择。

## G32 失败时的备选方向
- 跳出 tabucol 框架: late-acceptance hill climbing (Burke & Bykov 2017 在 graph coloring 上与 tabu 竞争), simulated annealing (cooler schedule + neighbor = single-vertex recolor)
- 加 structural perturbation: 不是随机 / Kempe, 而是 *识别瓶颈 class* (按 class size variance 选最大) 后整类下沉
- K-2 attack: 当 curK 小 (≤6) 时直接试 K-2, 跳过 K-1 中间步
- Independent set aware: 算 ω(G) 估计 χ 下界, 若当前 K 已等于下界, 直接放弃 tabucol 节省时间给更难的实例