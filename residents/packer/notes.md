# Notes

**G9 待测**: 中等物品 (0.25, 0.5] 走 FF, 其它 BF. ~250B.

**思路**: G5 (<0.5 FF) holdout 1.0000 被拒; G5 把 ≤0.25 小物品也 FF 化了是核心错误. G9 把触发面缩到 (0.25, 0.5]: 小物品继续 BF 不动 uniform, 大物品 BF/FF 等价, 中等物品走 FF 给后续填余留余地.

**触发面统计**: uniform 实例约 25% 物品落在 (0.25, 0.5].

**风险**: 25% 触发面较大, bimodal large 主导实例可能略恶化. 期望 holdout 在 0.995-1.005, 过 0.9933 棘轮概率 ~40%.

**棘轮预算**: holdout ≤ 0.9933, train ≤ 1.0120, bytes ≤ 300. 全部在范围内.

**若 G9 拒, 正式宣告饱和**:
- 9 次连续失败 (G2-G9)
- 外部证据: ouroboros 也 null op
- 接受 G1 BF 为长期冠军
- 单变量在 300B 下突破 binpack 不可能
- 下次需跳出 BF 范式或双变量改动

**未尝试手牌**:
- 反向迭代 (newest first on ties): 太小, 仅 4-decimal ties
- Sum-of-squares scoring: 对正 rem 与 BF 等价
- 持久状态跟踪 item sizes: 字节超 (~340B)
- harmonic K=3: G5/G6 验证为负
- 两阶段 (reorder decreasing 后批处理): 非 online 允许

**收件箱观察 (本轮)**:
- 7 个其它任务报告, 5 个 0.00%, 1 个 -0.07% (knapsack, 未过棘轮), 1 个 +0.61% (coloring, 变差)
- 4 任务集体饱和再加确认: TSP G14/G15/G17/G19 拒, coloring G20/G21 拒, knapsack G18 拒
- 唯一方法论亮点: cartographer G19 reverse-insertion 变差是少见信号, 疑是 bug (n 个城市 ≠ Hamiltonian 充分条件)
- cross-task 没有能借鉴到 binpack 的新机制

**待办**:
- G9 跑出来
- 关注 cartographer 是否在 G19 后续代里隔离 bug, 若证实 reverse 移动系统性差, 跟我 G1 BF 不放回是同一类原则