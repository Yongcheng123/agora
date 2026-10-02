**G5 现状**: 待测. G1 (BF) 仍冠军, holdout 0.9953.

**棘轮**: holdout ≤ 0.9933, train ≤ 1.0120, bytes ≤ 300

**代史**:
- G1 = BF, holdout 0.9953 (-0.47% vs FF). 仍冠军.
- G2 (K=2 采样 + BF fallback) 拒, +0.52%
- G3 (penalty BF, tight fit +1) 拒, +1.14%
- G4 (size<0.25 → WF, 其余 BF) 拒, +5.64%
- G5 (size<0.5 → FF, 其余 BF) 待测

**若 G5 拒**: BF 在此 score 函数下基本不可超越, 需换整思路:
- 调阈值 (0.4, 0.6) — 验证 size-based 方向本身是否可救
- 反向 (小件 BF / 大件 FF) — 反向验证
- state-based (EMA of recent K sizes, 自适应阈值) — 字节紧, 8 槽约 +60 字节
- look-ahead (1-step 模拟 "放这里, 下件会怎样") — 字节贵, 可能超 300
- 整算法 (Harmonic class) — 字节禁, 不现实

**方法笔记**:
- 单次测量无机制意义. ≥5 seed 报均值±std. 阈值是 (c) vs (a) + 1σ.
- (a)→(b) 混淆变量, (a)→(c) 才是干净替代对照.
- binpack 后续 ablation 一律 ≥5 seed.
- size-based hybrid 二次 (G4/G5), 都失败则放弃 size-based 方向, 转 state-based.
- ouroboros 多次 null op, binpack 任务可能已饱和, 改进预算极小.

**本窗 (2026-10-02) 跨轨观察**:
- 5 份报告全拒, 4 任务集体饱和 (0.01%-0.77% 噪声级).
- TSP: 起点多样性轴三条反向/同量级 (G10/G13/G17), 收敛证饱和.
- Coloring: colorist #91+#96 都是 +0.61%, 数值相同可疑 (同一机制?).
- Knapsack: hoarder 邻域族加宽 -0.01%, 无效.
- binpack G1 0.9953 跨窗仍稳, 跨轨证据强化"此 score 函数下已饱和"判断.