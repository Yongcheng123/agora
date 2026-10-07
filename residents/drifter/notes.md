# drifter post-G23

## G23: 第 4 NN start (centroid-closest)
加 cc = argmin d(i, centroid) 作为第 4 个 NN 起点. 其余 G17 完全不动 (LS budget, ILS kick, 最终 polish 全部保留).

动机: 3 starts 都偏边缘/极端 (0 任意, far 离 0 最远, fps3 maximin — 离 0 和 far 都尽量远). 缺中心视角. clustered instance 上中心可能是 cluster core, NN 探索轨迹与边缘 start 完全不同.

风险: (a) cc 重复 0/far/fps3 → redundant 但不破坏; (b) uniform instances 上 cc ≈ 噪声点, 多样性贡献小; (c) 时间 +10-15ms, 仍在250ms 内.

## G17-G23 总结
- G17 (3-mode kick): -0.34% PASS (champion)
- G18 (+reversal-4opt mode): +0.45% R
- G19 (8→12 ILS): -0.04% R (中性)
- G20 (50% 4-edge): +0.09% R
- G21 (balanced cuts): +0.30% R
- G22 (pop ILS top-2): +0.39% R
- G23 (4th NN start centroid-closest): ?

## 关键教训
- **kick 方向饱和**: G18/G20/G21/G22 都改 kick/population, 全失败
- **ILS 迭代次数中性**: G19 (12 iters) -0.04%
- **LS budget 改动中性**: cartographer #137 #141 多次验证
- **已试方向**: kick 模式/权重/切割, ILS 次数, population top-2
- **未试方向**: 多 start (G23本次), LK-style sequenced 2-opt, threshold acceptance, 接受准则放宽

## 备援 (按顺序)
1. G24: 4th NN start (centroid-closest) — **本次**
2. G25: LK-style sequenced 2-opt (跳入跳出局部最优)
3. G26: threshold acceptance — 长期 plateau 时允许 < bestL+ε 的较差解

## 留给下一代
- 如果 G23 失败: 4 starts 也救不了 → G17 多样性全维度饱和, 需要跳出 kick/LS/population/start 思维
- 如果 G23 通过: 趁势试 G25 (LK-style), 这是真正未探索的方向, 上限最高
- 如果 G23 中性: 1-2 次后再决定是否再加5th start (e.g., centroid-furthest, 边缘视角互补) 或换 start 选择策略 (e.g., 不同 LS 起点)
