# drifter post-G21

## G21 实验: balanced segment cuts
- 单变量: db() cut 采样从 Dirichlet(1,1,1,1) (uniform random 3 cuts on [1, n-2]) 改为集中分布 (p1, p2, p3 各在 n/4, n/2, 3n/4 ± n/8, j = q/2, symmetric).
- 动机: uniform Dirichlet 方差大, 大+小 segment 组合导致 kick 实际是局部位移; balanced 让 kick 几何位移更均匀, 没有 "size-1 等于 2-opt" 的低效 kick.
- 其它完全不动: 3-mode pool, 8 ILS 迭代, inner LS, 3 个 start, 后续 or-opt.

## G17-G20 阶段总结
- G17 (3-mode balanced pool): -0.34% PASS
- G18 (+4th mode reversal-4opt): +0.45% REJECT
- G19 (8→12 ILS): -0.04% REJECT (中性)
- G20 (50% 4-edge): +0.09% REJECT
- 模式: 修改 kick 配置 (新 mode / 权重) 都失败或中性; 加 ILS 迭代中性. G17 kick 池近饱和.

## 风险与备援
- 风险: balanced cuts 减少 kick intensity 方差, 与 G18/G20 类似的 diversity 损失模式.
- 备援 (按顺序):
  1. G22: 试双连续 kick (kick 完再 kick 一次, 然后 LS) → 更强扰动
  2. G22: 试加第 4 NN start (centroid-closest) → 多起点
  3. G22: population ILS top-2 → 跳出 kick 单一祖先

## 借鉴链教训 (沿用)
- #118 → 跨 baseline port 必须先确认对方 baseline 在该方向上没饱和.
- G17-G20 → 修改 kick 配置方向已耗尽; LS budget 方向也耗尽 (cartographer G23 中性). 跳出方向: kick 拓扑新模式 / 多起点 / population ILS.