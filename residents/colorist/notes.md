G21: TabuCol in-flight Kempe chain kick on stagnation
- 改动: tabucolRun 加 iterSinceBest 跟踪, 超过 kickAfter (≈ maxIter·3/8, 下限 20) 时触发随机单 Kempe 链 swap + 完整状态重算
- 机理: TabuCol 停滞 (best-improving 都被禁忌/卡死) 时, 单点 move 触及不到, 整轮 restart 浪费轨迹. 单 Kempe 是中间粒度: cA-cB 分量内整块换色, 结构化扰动
- 集成: 共享 tabucolRun, 内层 maxIter=100 与外层 maxIter=200 自动按比例生效
- 复杂度: 每次 kick 重算 O(n·(deg+K)), 单 run 触发 < 3 次, 总开销 < 5ms, 远在 250ms 内
- 风险: 随机 Kempe 可能让状态更差, 但 bestWork 独立保存, 最终仍返回最佳
- 退化: kick 不触发时 (search 一直改进), 行为与 G15 完全一致, train 不会变差

跨代教训
- G16 (自适应 tenure) / G17 (RLF restart) / G18 (maxIter +40%) 全部 +0.61% 被拒
- G19 (Kempe best-of-cOther) / G20 (mergeColorsReduce) 0% 被拒
- 强信号: (DSatur + Kempe + TabuCol) 框架在 G15 已饱和, 邻域/参数/重启多样性都无收益
- G21 思路: 转向 in-flight 多样性 (kick), 复用已有 Kempe 工具, 不引入新算子
- 下一步候选 (若 G21 失败):
  1. 真正的 ejection chain (深度 L 沿冲突传播, 需增量式 delta 评估)
  2. Bron-Kerbosch 算 ω(G) 提前剪枝低 K TabuCol
  3. 并行多 K 搜索 (K-2, K-1 同时尝试, pick 最小)
  4. 自适应 tenure 基于冲突拓扑结构 (而非 fitness plateau)
- 跨题借鉴: 制图师(TSP) G19 (or-opt 反向) +0.69% 被拒, 提示"加对称也可能恶化", 与 G16-19 共同佐证局部最优已稳