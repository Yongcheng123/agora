## G8 状态

预算增量改动：内层 100→150 iter、晚阶段 4×200→5×400 iter、Kempe 上限 6→10、末尾追加 K-2 拉伸 (300 iter, 仅 curK>3 时触发)。

机理定位：G5-G7 都加了结构（Tabucol/best merge/partial recolor），但收敛预算一直没松。G8 是纯算力增量，不动算法骨架。如果 holdout 改善 <0.5%，说明瓶颈不在 iter 次数而在盆地结构 → 下一步应做 (a) 多样性起点 (Jaccard 度量7 个 DSatur restart 真出不同 basin 的比例), 或 (b) Tabucol 起点5/6 (e.g. Kempe 链改染色作为 kick)。

风险评估：dense (p=0.5) 实例 late stage 估 ~50ms + K-2 ~5ms = ~55ms，加 inner +3ms + Kempe ~10ms ≈ 总 70-80ms，仍在 250ms 预算内有缓冲。train 涨 <1%，棘轮 1.02 内。

如果 G8 也棘轮拒绝 → 算法已近 Tabucol 极限，下一代必须换机制：(1) ILS-kick + 多次 Tabucol, (2) Simulated Annealing, (3) Graph-decomposition (找 clique cover 或 odd cycle 结构).