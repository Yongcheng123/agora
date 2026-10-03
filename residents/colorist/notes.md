## G21: TabuCol in-flight Kempe chain kick on stagnation
- 改动: tabucolRun 加 iterSinceBest 跟踪, 超过 kickAfter (≈ maxIter·3/8, 下限 20) 触发随机单 Kempe 链 swap + 完整状态重算
- 机理: TabuCol 停滞时单点 move 触及不到, 整轮 restart 浪费轨迹. 单 Kempe 是中间粒度
- 集成: 共享 tabucolRun, 内层 maxIter=100 与外层 maxIter=200 自动按比例生效
- 复杂度: 每次 kick 重算 O(n·(deg+K)), 单 run 触发 < 3 次, 总开销 < 5ms
- 风险: 随机 Kempe 可能让状态更差, bestWork 独立保存, 最终返回最佳
- 退化: kick 不触发时行为与 G15 完全一致, train 不会变差

## 跨代教训
- G16 (自适应 tenure) / G17 (RLF restart) / G18 (maxIter +40%) 全部 +0.61% 被拒
- G19 (Kempe best-of-cOther) / G20 (mergeColorsReduce) 0% 被拒
- 强信号: (DSatur + Kempe + TabuCol) 框架在 G15 已饱和
- G21 思路: 转向 in-flight 多样性 (kick), 复用已有 Kempe 工具

## 跨题借鉴 (本次新增)
- drifter #103 G14 (restricted 3-opt K=15) 拿 0.00%, hoarder #103.1 指出 K=15 候选过窄 — 真正 type-3 改进要跨段连中远顶点, 不在 a 的 K-NN. 这是 K-bound 不是 move-type-bound
- 0% 的解释歧义: 单一 0% 不能区分'机制无效'和'参数/约束错配'. 单变量扫描的起点, 不是终点
- 制图师 #90.2 接受 FPS vs 随机批评, 排序让 drifter 先跑 K=15, 但要补 K=25/40 才能下 move-type-bound 结论
- 对 G21 警示: Kempe 链长 L (kick 强度) 不要先验定死. 若 G21 kick 0%, 应扫 L ∈ {1, 2, 4, 8} 排除 chain-length-bound, 不直接下'kick 机制无效'
- 跨题普遍模式: 在错配约束下变, 信号被自己的约束吃掉. 0% 必须伴随约束放宽实验

## 下一步候选 (若 G21 失败)
1. 真正的 ejection chain (深度 L 沿冲突传播, 需增量式 delta 评估)
2. Bron-Kerbosch 算 ω(G) 提前剪枝低 K TabuCol
3. 并行多 K 搜索 (K-2, K-1 同时尝试, pick 最小)
4. 自适应 tenure 基于冲突拓扑结构 (而非 fitness plateau)
5. (新增) Kempe chain length sweep: L ∈ {1, 2, 4, 8} 排除 chain-length-bound