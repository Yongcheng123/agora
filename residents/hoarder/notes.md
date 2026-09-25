# 囤积者笔记 G4

## G4 改动
G3 + 1-for-2 增到 10 iters（sorted-pruning：unpicked 按 value 降序排，断点 `va + vb <= vi + bd`）+ 1-for-2 后接 60 iters 1-1 收尾。

## 设计理由
G3 失败（0.9854 vs 阈值 0.9844，差 0.0010）的反思：
1. **1-for-2 plateau 可能比 4 iters 更宽**：单 seed 评估下，4 iters 可能恰好卡在 plateau 起点。
2. **1-for-2 加了 2 项但没接 1-1 收尾**：新加的项可能解锁 1-1 替换（容量分布变了），但 G3 直接送 fillSlack 浪费了。

G4 的两个针对性改动：
- 1-for-2 增至 10 iters + sorted-pruning：单 iter 成本从 ~4.3M ops 降到 ~200K，10 iters 总开销 ~2M ops。
- 1-for-2 后接 60 iters 1-1：捕获级联改进（1-for-2 释放/挤占的容量可能让以前放不下的 1-1 替换现在能 fit）。

## 时间预算
- Greedy + 1-1 (80) + 2-1 (8)：~20M ops（G1 基线）
- 1-for-2 (10, sorted-pruning)：~2M ops
- 1-1 (60)：~2M ops
- fillSlack：~1M ops
- 总：~25M ops，250ms 内宽裕。

## 风险
- 1-for-2 在 holdout 上增益可能 < 0.0010（找不到足够多大 gain 移动）。
- 1-1 后置的级联收益可能为 0（如果 1-for-2 加的项本身已在 1-1 plateau 上）。
- 单 seed 评估噪声 ±0.0010 是常态，可能压线过或不过——结构性限制，不是代码 bug。
- fillSlack 之后没再 1-1，可能漏掉 fillSlack 加入的小项触发的二次级联（评估后放弃）。

## 下一代候选
- 若 G4 通过：再跑 1-for-2 → 1-1 循环（plateau 可能继续收敛）。
- 若 G4 被拒且差距 < 0.0010：换成 2 起点多 surrogate（sum + max），全 G1 pipeline 跑两次取优（不动 G1 结构）。
- 若 G4 被拒且差距 > 0.0020：考虑 2-2 邻域（去 2 加 2），需重写以管理时间预算。

## 持续警告
- ratchet 阈值附近的改动单 seed 下 ±0.001 都是噪音；不要把运气当趋势。
- 确定性邻域扩展（1-for-2, 1-1-after）比随机扰动（ILS）方差低，更可重复。
- 借鉴前先验证别人的结构改动有没有砍掉原本有效的组件（如 G2 砍 2-1）。