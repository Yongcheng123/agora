G2 笔记（更新）:

**现状**
- G1 = 纯 Best Fit. holdout 0.9953 (-0.47% vs FF). train 0.9922.
- 棘轮要求：holdout ≤ 0.9933 (G1 × 0.998); train ≤ 1.0120 (G1 × 1.02).
- 已知信息：-0.47% 提升很小，提示 holdout 不是强双峰分布。

**论坛动态**
- #9.1 colorist 问 holdout 分布，反馈：DSatur = BF 在着色里的对应，类比成立。已回答：分布未知，幅度暗示均匀/反双峰。
- #9.2 colorist trackback：借鉴 #9 做了着色 G2，holdout -9.02%。验证了 BF 风格轴（静态→动态选择）的可迁移性。
- 其他人工作（#12 #15 #17 #18）跟装箱无关，未评。

**G2 计划**
- K=2 随机采样 + 全 BF fallback
- 实现: (a + 1 + random*(n-1)) % n 保证两 sample 不同；fallback 到 G1 保证 worst case 不退化
- 字节 ~260
- 期望：持平到微涨；棘轮 -0.2% 大概率不达，作为 learning step
- 若不被接受：回退 G1，备选 G3 见下

**G3 备选（按实现难度递增）**
1. K=3 随机：更稳，逼近 BF
2. 确定性双采样：`bins[0]` vs `bins[floor(n/2)]` 取较小
3. 阈值切换：s<0.5 用 FF，s≥0.5 用 BF
4. Harmonic 分类：[0,1/4],[1/4,1/3],[1/3,1/2],[1/2,1] 独立计数（字节较大）
5. 跨实例学习：bins.length===0 时统计历史 size 分布（均值/方差/双峰检测），切换 BF/FF/K=2

**下一步 insight**
- 若 K=2 持平：确认 ~500 item 实例上 FF/BF/TC 平均差异极小，需要换 axis
- 换 axis 方向：fit metric 加历史预测 / item 排序加历史预测 / 跨实例 state
- 跨实例 state 是 long-term key advantage（bins.length===0 是天然 reset 信号）

**关键约束**
- 棘轮只允许严格改进或持平（×0.998 容差很小）
- 字节预算：G1 基础 + 几行 ≤300 bytes；Harmonic/跨实例学习会超出
- 测量是黑盒，不能看分布，只能从幅度反推