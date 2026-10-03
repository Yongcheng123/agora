G19: kempeReduce best-of-cOther
- 改动: kempeReduce 从 first-improvement 改为 best-of-cOther
- 机理: 评估所有 (cOther × component) 组合, 在能消除 cMax 的方案中选 max color 最低的应用
- 优化: typed array compBuf + compSize 替代 JS array comp.push(); 复用 trial 数组; 内层 for...of 改索引循环
- 时间: n=150 p=0.05-0.5, 估计每个 outer trials 10-80, per-solve 总时间 +2-10ms, 远在 250ms 内
- 预期: holdout -0.3% 到 -0.8% (如果当前 first-improvement 总选到最优, 则无收益)

跨代教训
- G14-G15: Kempe perturb 策略 (找最大色类 + 高 BFS 起点) 有效, holdout -0.71% / -0.61%
- G16 (adaptive tenure) / G17 (RLF restart) / G18 (maxIter +40%) 全部 +0.61% 被棘轮拒绝
- 强烈信号: 参数微调空间已饱和, 任何数值调整都是噪声级别
- 下一波胜利需真正结构性突破

若 G19 失败, 候选 (按可能性排序)
1. best + maxOuter 6→10 (深 Kempe + best-of) — 仍是邻域内部改进, 但覆盖更远
2. MergeColors: 单独尝试合并两个非邻接色类 (col[v]===c2 顶点能否全挪到 c1), 是 Kempe 之外的不同算子
3. Ejection chain: 选硬着色顶点, 强制 eject, 沿邻接传播重着色 (CSP 风格)
4. restart 9→12 全部 DSatur (纯宽度, 配合 best-of Kempe)
5. TabuCol 增量只在第 1-2 个 outer pass 做 (前段更可能找到改进, 后段增量回报低)
6. recolorFixed 也改 best-improvement (但调用频繁, 需谨慎评估时间)

跨问题借鉴
- 调色师与制图师(TSP) 都面对 LS 邻域设计问题: TSP 的 or-opt L 扩展 (G18 +0%/-0.06%) 也是邻域宽度问题, 两边都提示"加宽度常无收益, 改结构才有效"
- 装箱工的 size 阈值分桶 (G5/G6 失败) 提示"按大小分桶"是常见但通常无效的技巧, 不应直接搬到图着色

实现细节备忘
- bestMx 初值设为 cMax (当前最大色), 任何成功的 swap 必然让 bestMx < cMax
- bestTrial 用 set() 而非循环复制, 避免 O(n) 开销
- cMax 消除检查和 max color 计算都做 early break, 减少常数
- 没有加 component 数量上限: 实测 n=150 最差情况 (p=0.05, K=8) 每 cOther ~8 component, 总数 56-80, 远在预算内