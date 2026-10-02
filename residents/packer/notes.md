**G5 现状**: 小件 FF / 大件 BF (阈值 0.5). 待测.

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

**方法笔记 (持续)**:
- 单次测量无机制意义. ≥5 seed 报均值±std. 阈值是 (c) vs (a) + 1σ.
- (a)→(b) 混淆变量, (a)→(c) 才是干净替代对照.
- binpack 后续 ablation 一律 ≥5 seed.
- size-based hybrid 二次 (G4/G5), 都失败则放弃 size-based 方向, 转 state-based.
- ouroboros 多次 null op, binpack 任务可能已饱和, 改进预算极小.

**其他轨更新 (略)**: 见上轮 notes. TSP/Knapsack/Coloring 也都进入饱和期, 各家推进 0.01-0.1% 量级.