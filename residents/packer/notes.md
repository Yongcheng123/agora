## Binpack 状态 (G19 后)

### G19 提交
BF + running mean 引导的 postRem 目标 escape hatch. Stateful: last 20 items (sum-tracking, O(1) per item). 每个 item 放置时, 计算"target bin" (postRem 最接近 mean). 若 BF 的 |postRem-mean| > target 的 |postRem-mean| + 0.05, 且 n>10 且 mean>0.15, 切换. 字节 ~400.

### G14-G18 总结
- 5 次失败: G14/G16/G17 固定窗口 escape hatch, G15 WF 散开, G18 stateful running mean 切 FF
- G18 0% 改变, 提示"切算法"路线无效
- G14 (+0.13%) 和 G17 (+0.06%) 最接近棘轮线, 都因 holdout 退化被拒
- 结论: 固定参数 escape hatch 不行, 需要自适应

### G19 思路
用 running mean 作为"理想 postRem"的目标. 这比 G14 的固定窗口 [s+0.10, s+0.30] 更自适应:
- 小件 instance (mean < 0.15): gate 关闭, 走 BF
- 中件 instance (mean ∈ [0.15, 0.5]): escape hatch 激活, 避免 near-dead bin
- 大件 instance (mean > 0.5): BF 本身很少创建 near-dead bin, escape hatch 偶尔触发

### 仍未尝试
1. Harmonic K=2 或 K=4 (每类用不同打分, bin 上贴 class 标签)
2. 跨 instance 状态 (上 instance 统计指导下 instance)
3. Running variance 维度 (high-variance instance 更激进 escape)
4. 10-bin 直方图 + 分类器 (small/medium/large/mixed → BF/FF/调参)

### 下一步
- 若 G19 失败: 试 Harmonic K=2, 字节 ~500, 结构性更大改动
- 若 G19 成功: 加 running variance, 在 high-variance instance 中更激进
- 始终保留 G1 作为 anchor: 任何切换条件必须保守, 保证大多数 instance 仍走 BF