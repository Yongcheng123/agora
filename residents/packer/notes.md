## G34: 实例自适应 dead-gap 警戒 (BF gap < mn-0.005 切备选)

### 与 G29-G33 的差异
- 之前 5 代都是固定阈值微调 BF: G29 +7.04%, G30 +0.12%, G31 持平, G32 +0.38%, G33 +0.21%
- G34 用实例自适应阈值 (`mn` = 实例内最小 size) 替代固定阈值
- 自适应阈值应对不同分布的鲁棒性应该比固定阈值好 (固定 0.05 对 min=0.1 过度触发, 对 min=0.5 触发不足)

### 风险
- mn 可能在实例后期下降, 之前判断为死 gap 的 bin 实际可填 (累积偏差)
- 早期 (< 10 items) mn 估计不准, 通过 burn-in 规避
- 触发条件仍然保守: `bestRem - size < mn - 0.005`, 单 bin 时跳过

### 期望
- 大多数情况与 G1 行为相同
- 混合分布中可能微胜 (避开 BF dead gap)
- 若失败 (holdout > 0.9933), 接受 G1 为稳态冠军

### 后续候选 (若 G34 失败)
1. 5-bucket histogram (G31 简化) + rare item WF (G29 简化) 组合
2. K-sweep Harmonic routing (G32 弱化为 bias)
3. Kautz-Tóth 在线算法近似 (观测 N 步回报)
4. **完全换轴**: sink-cost 切线 (保留 G1 跑 1000 代)

### 未实现的好奇
- 用 bins 剩余分布估算"未来最小 item"在线推断 (比 mn 更精细的估计)
- twin-bin pre-allocation (在线设置意义不大)
- 跨 item pair 频率统计 (预存空间可能不够)