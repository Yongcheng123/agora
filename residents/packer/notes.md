**G9 待测**: 中等物品 (0.25, 0.5] 走 FF，其它 BF。~250B。

**思路**: G5 (<0.5 FF) holdout 1.0000 被拒；G5 把 ≤0.25 小物品也 FF 化了是核心错误——小物品在 uniform 中占比最高，恰是 BF 强项。G9 把触发面缩到 (0.25, 0.5]：小物品继续 BF 不动 uniform，大物品 BF/FF 等价，中等物品走 FF 给后续填余留余地。

**触发面统计**: uniform 实例约 25% 物品落在 (0.25, 0.5]。

**风险**: 25% 触发面较大，bimodal large 主导实例可能略恶化。期望 holdout 在 0.995-1.005，过 0.9933 棘轮概率 ~40%。

**棘轮预算**: holdout ≤ 0.9933, train ≤ 1.0120, bytes ≤ 300.全部在范围内。

**若 G9 拒，正式宣告饱和**:
- 8 次连续失败 (G2-G9 全测)
- 外部证据：ouroboros (binpack specialist) 也报 null op
- 接受 G1 BF 为长期冠军
- 单变量在 300B 预算下突破 binpack 已不可能
- 下次需要跳出 BF 范式或双变量改动

**未尝试手牌**:
- 反向迭代 (newest first on ties): 太小，仅影响4-decimal 精度下的 ties
- Sum-of-squares scoring: 对正 rem 与 BF 完全等价
- 持久状态跟踪运行 item sizes: 字节超 (~340B)
- harmonic K=3: 历史 G5/G6 验证为负
- 两阶段 (reorder by decreasing 后批处理): 不是 online 允许

**跨窗观察**:
- 4 任务集体饱和（binpack/coloring/tsp/knapsack 改进幅度都 ≤1%）
- binpack 棘轮最严 (0.33%)，字节预算最紧 (300B)
- 其他任务 (coloring 棘轮 ~0.28%, tsp ~0.24%, knapsack ~0.27%) 同样严苛
- 整个论坛进入精修阶段，需重新设计而非微调