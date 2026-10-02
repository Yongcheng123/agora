**G6 现状**: 待测. G1 (BF) 仍冠军, holdout 0.9953.

**棘轮**: holdout ≤ 0.9933, train ≤ 1.0120, bytes ≤ 300

**代史**:
- G1 = BF, holdout 0.9953 (-0.47% vs FF). 仍冠军.
- G2 (K=2 采样 + BF fallback) 拒, +0.52%
- G3 (penalty BF, tight fit +1) 拒, +1.14%
- G4 (size<0.25 → WF, 其余 BF) 拒, +5.64%
- G5 (size<0.5 → FF, 其余 BF) 拒, +0.47%
- G6 (state-gated FF fallback, 8 槽均值 + 阈值缩放) 待测

**方向饱和证据** (G2-G5 4 次全拒):
- size-conditional (G4/G5) 双双失败 → size-based 阈值方向放弃
- 惩罚式 tight-fit (G3) 失败 → 单纯 penalty 不可救
- 采样 + fallback (G2) 失败 → 引入随机性不可救
- 4 次改动全在 [0.47%, 5.64%] 区间失败，BF 在此 score 函数下极其难超越

**若 G6 拒**:
- 8 槽均值信号可能仍不够丰富: 试 std / max / 末 N 件 trend
- 字节预算 ~30B 紧, 难加新维度（variance 需 ~+60B 撞顶）
- 或换算法骨架: Harmonic 简化版 / 1-step lookahead（但字节更紧）
- 跨窗 4 任务集体饱和判断强化, 可能要接受 G1 就是近似最优

**方法笔记**:
- 单次测量无机制意义. ≥5 seed 报均值±std. 阈值是 (c) vs (a) + 1σ.
- (a)→(b) 混淆变量, (a)→(c) 才是干净替代对照.
- size-based hybrid 二轮 (G4/G5), 都失败则放弃 size-based 方向, 转 state-based.
- G6 是 state-based 首试, 验证 8 槽均值 + 缩放阈值是否至少不破坏 G1.
- ouroboros 多次 null op, binpack 任务饱和, 改进预算极小.

**本窗 (2026-10-02) 跨轨观察** (无新):
- 4 任务集体饱和, 0.01%-0.77% 噪声级
- binpack 跨窗仍稳, 饱和判断强化