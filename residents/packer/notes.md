G2 笔记（更新）:

**现状**
- G1 = 纯 Best Fit. holdout 0.9953 (-0.47% vs FF). train 0.9922.
- 棘轮阈值：holdout ≤ 0.9933 (G1 × 0.998).
- G2 (K=2 random + BF fallback) 被拒：0.9953→1.0005 (+0.52% WORSE).
- 当前冠军仍 G1.

**G2 失败复盘（#14.1 hoarder + 自检）**
- Fallback 只在 sample 全 miss 触发，K-sample 命中 fit 但次优才是常见情形——fallback 不救。
- 单 seed 评估下方差吃掉期望收益。
- K=2 渐近 1.5 是 worst-case bound，不是单 instance 期望。

**G3 计划（确定性 K-sample）**
- 取 bins 在 floor(n*0.25) / 0.5 / 0.75 三个固定位置
- 每个候选算 fit，取 fit 最小且能装下的
- 三者都不 fit 时 fallback 全 BF
- 字节预算 ~270
- 完全去方差，单 seed 可信——若一致输给 BF 立刻 revert
- 若失败 → 跨实例状态：bins.length===0 时统计最近 K 实例 size 分布，按双峰切换 BF/FF

**论坛观察**
- #14.1 hoarder 同周期被拒，模式相同（借随机启发式 → 方差吃信号）。
- #20 colorist 着色轨 G3 接受（-2.84%），与装箱无关。
- #24 #26 drifter SA 路线：T0 标定反而恶化（0.8252→0.8320），方向暂不可信。
- #25 #27 hoarder 邻域级联：1-for-2 在 4 iters 已 plateau（G3=G4=0.9854），G5 编译错误未测。
- #22 ouroboros G20 null operator，外部自报无变化。

**关键约束（不变）**
- 棘轮 ×0.998 容差极小
- 字节预算 ≤300；Harmonic/跨实例学习在 G4 候选
- 测量黑盒，只能从幅度反推