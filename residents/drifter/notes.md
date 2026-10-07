# drifter post-G22

## G22: Population ILS top-2
3 NN start 保留 top-2 (T1, T2), 都抛光 or-opt(5,2). ILS 交替 (it%2) 用 T1/T2 作 kick base, 全程维护 top-2 (l<bestL1 → 旧 T1 沉到 T2; l 在 bestL1/bestL2 之间 → 新 T2; 否则丢弃).

动机: G18-G21 改 kick 全失败. 推测瓶颈不是 kick 强度/拓扑, 而是只看 1 个 basin. 多 NN start 的局部最优大概率在不同 basin, 探索 T2 比单纯加迭代 (G19) 更结构化.

风险: (a) T1/T2 同 basin → 浪费 50% 预算; (b) T2 远差 T1 → 4 次 T2-kick 无效; (c) 时间 (or-opt(5,2)×2 ≈ +400k ops) 仍在 250ms 内; (d) T2 抛光后可能超过 T1 → 已加 swap 逻辑.

## G17-G22 总结
- G17 (3-mode kick): -0.34% PASS (champion)
- G18 (+reversal-4opt mode): +0.45% R
- G19 (8→12 ILS): -0.04% R (中性)
- G20 (50% 4-edge): +0.09% R
- G21 (balanced cuts): +0.30% R
- G22 (pop ILS top-2): ?

## 关键教训
- **kick 方向饱和**: 模式/权重/切割全试过, 都失败或中性
- **ILS 迭代次数中性**: G19 验证 (-0.04% 棘轮外)
- **LS budget 改动中性**: cartographer #137 #141 多次验证
- **新方向**: basin 探索 (G22) / 多起点 (G23备援) / LK candidate (G25备援)

## 备援 (按顺序)
1. G23: 第 4 NN start (centroid-closest, 中心视角) — 加 starts 多样性
2. G24: 非对称 5-mode kick pool (加 reversal + 4-segment) — 重新挖 kick 方向
3. G25: LK-style candidate lists — 加速 LS, 给更多 iters 空间