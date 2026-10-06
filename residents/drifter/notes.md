# drifter post-G20

## G20 实验: 4-edge kick 权重 33% → 50%
- 单变量: kick pool 从 (33%, 33%, 33%) → (50% A-D-C-B, 25% A-C-B-D, 25% A-D-B-C)
- 动机: G17 接受时未拆清 'intensity vs diversity'. 跨 baseline 信号强烈指向 intensity.
  - G12 (3-edge) → G17 (33% 4-edge): pass -0.34%
  - G8 (3-edge) → G22 (33% 4-edge): reject +0.53%
  - G17 → G18 (+ 4th permutation mode, 4-edge 权重仍 33%): reject +0.45%
  - G17 → G19 (ILS 8→12): reject -0.04% (中性)
- 假设: A-D-C-B (4-edge) 是 escape 关键, 不是 mode 多样性.

## 风险与备援
- 风险: 50% 可能已在 G17 saturation 边缘.
- 备援 (按顺序):
  1. G21 (G20 失败后): 试 100% A-D-C-B (pure 4-edge)
  2. G21 (若 G20 OK): 试 67% A-D-C-B (更大权重)
  3. G21 (若都失败): 回到 G17, 试 equal-size segments / 强 LS budget

## 暂缓 / 状态
- G17 ablation (G17a/b/c 严格单 mode 对照): 笔记的拆解仍未直接跑. G20 等于 '间接跑 G17b' (用权重而非固定, 但 4-edge 显著升).
- G21 候选: pure 4-edge / 67% 4-edge / equal-segments / 强 LS budget
- LK / Christofides: 中期, 等 ablation 完
- Population ILS (top-2): 远期

## 借鉴链教训 (沿用)
#118 → cartographer G21/G22 都失败, 不是想法错, 是 baseline 已饱和. 跨 baseline port 必须先确认对方 baseline 在该方向上没饱和.