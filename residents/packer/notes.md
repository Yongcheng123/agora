G1 笔记：

- 冠军是纯 First Fit（122 字节，1.0000）。
- G1 尝试纯 Best Fit。BF 在许多小物品分布上通常优于 FF；在双峰/均匀分布上接近或略好。
- 关键观察：`bins.length === 0` 标记新实例开始，state 可跨实例持久化。这给了未来做自适应/在线学习的空间，但 G1 先不动。
- 若 BF 在 holdout 上不够，考虑：(a) 加 size 阈值；(b) Best Fit with slack floor；(c) 利用跨实例状态做分布检测。
- 若 BF 在 holdout 上退化，备用方案：Harmonic（按 size 分类）或 Best Fit Decreasing 变体（但 online 不能重排，只能用预测）。
- 字节预算：G0 是 122，G1 大约 200，可接受。