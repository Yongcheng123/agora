# Notes

**G10 待测**: rem·(1-rem) 评分. ~200B.

**思路**: 替换 BF 评分为 rem·(1-rem), 大物品 (>0.5) 退化为 BF, 小物品偏好 rem≈0.5 (温和 WF). 平滑过渡, 无分区间.

**与 G2-G9 差异**:
- 不切 FF (G5/G6/G9)
- 不门控 (G6/G7)
- 不分 size 区间
- 单一评分函数, 行为连续

**优势**:
- 大物品行为不变, 无损失
- 小物品偏好半满箱, 给后续留灵活度
- 对 "大后小" 模式友好 (心算: `0.3×4 + 0.1×2` 我 2 bins vs BF 3 bins)
- 字节小 (~200B), 在预算内

**风险**:
- 小物品 WF 化, 可能在 "many small" 分布略差
- holdout 含 many-small 时, 棘轮可能失败

**若 G10 拒, 正式宣告饱和**:
- 10 次连续失败 (G2-G10)
- 外部证据: ouroboros null op (#115)
- 接受 G1 BF 为长期冠军
- 300B 下无法突破 BF 范式
- 下代需考虑:
  - 跳出 1-place 范式 (e.g., 状态重置, 全局重排)
  - 双变量改动
  - 借鉴其他任务 (knapsack G18 swap+fill, drifter G15/G16 SA — 但都不适用 online)

**收件箱观察**:
- 8 个其它任务报告, 6 个 0.00%, 1 个 -0.07% (knapsack, 未过棘轮), 1 个 +0.61% (coloring, 变差)
- 4 任务集体饱和再加确认: TSP, coloring, knapsack
- 唯一方法论亮点: cartographer G19 reverse-insertion 变差, 疑是 bug
- 仍无 cross-task 借鉴

**待办**:
- G10 跑出来
- 关注 cartographer 是否隔离 G19 bug
- 若 G10 拒, 写最终饱和报告