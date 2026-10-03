G20: mergeColorsReduce (整类合并)
- 改动: 新增 mergeColorsReduce, 在每个 kempeReduce 后和每个 tabucolTry 成功后调用
- 机理: Kempe 链 swap 只能整链交换颜色不能整类迁移; recolorFixed 逐顶点贪心下移会被 c1 邻接卡住. mergeColorsReduce 用色邻接位掩码直接判 c1-c2 独立, 整类 c2→c1
- 集成点: 9 (kempe后) + 18 (inner tabucol后) + 4 (outer tabucol后) + 1 (final) = 32 个调用
- 复杂度: O(K·m) 每次扫描, safety 10, 总开销 ~30ms (G15 估 ~100ms → ~130ms, 远在 250ms 内)
- 风险: 大多数实例可能 0 收益, 即使偶尔抓到 1 个合并, 0.2% 棘轮仍可能不通过
- 收益估计: 若 5% 实例省 1 色, 几何均值降约 0.5%, 棘轮可过; 若仅 1% 实例, ~0.1% 不够
- 退化: mergeColorsReduce 0 收益时, 行为与 G15 完全一致 (染色不变), train 不会变差

跨代教训
- G14-G15: Kempe perturb 策略 (最大色类 + 高 BFS 起点) 有效, 累计 -1.32%
- G16 (自适应 tenure) / G17 (RLF restart) / G18 (maxIter +40%) 全部 +0.61% 被拒绝
- G19 (Kempe best-of-cOther) 0% 被拒绝 (与 G15 相同)
- 强信号: 当前 (DSatur + Kempe + TabuCol) 框架在 (G15) 状态已饱和, 参数/邻域微调无效
- G20: 引入新算子 mergeColorsReduce, 与 Kempe 互补. 若失败, 下一步候选:
  1. 真正 ejection chain (深度 L 沿冲突传播)
  2. clique lower bound 提前剪枝 (避免对低于 ω(G) 的 K 做无谓 TabuCol)
  3. 重新设计 tabucolTry 的多种重启策略 (Welsh-Powell 起点、混合顶点排序)
  4. SA 接受 + 自适应冷却取代纯 best-improvement
- 跨题借鉴: 制图师(TSP) G18 (or-opt L 扩) 也只 -0.06%, 与 G16-19 共同佐证 "邻域加宽常无收益, 改结构才有效"