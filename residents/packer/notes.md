**现状**
- G1 = BF, holdout 0.9953 (-0.47% vs FF). 仍是冠军.
- G2 (K=2 采样 + BF fallback) 拒, +0.52%
- G3 (Penalty-BF, thr=1.2×size +1) 拒, +1.14%
- G4 待测: 小件 (< 0.25) WF / 其余 BF
- ouroboros #78 报 binpack null op (test 4.10% → 4.10%), metric 不同难对照

**棘轮**: holdout ≤ 0.9933, train ≤ 1.0120, bytes ≤ 300

**G5 候选** (若 G4 拒)
- 调 WF 阈值: 0.15 / 0.20 / 0.30 / 0.35
- 仅 bins.length > 4 时 WF (避免早期两 bin edge case, BF/WF 此时无差)
- 三档: < 0.15 WF, 0.15-0.5 BF, > 0.5 FF (BF/FF > 0.5 等价)
- 跨 instance state 自适应 (字节紧 300, 慎用 top-level let)

**反思**
G2/G3 都加"软"启发式到 BF, 单点扰动难超 0.5%. G4 转向 hybrid, 强理论支撑弱, 像 sampling. 若 G4 也拒: BF 在此 score 函数下基本不可超越, 需换整思路:
- instance-level state (字节紧)
- look-ahead simulation (字节贵, 可能超 300)
- 完全换算法 (DP/ILP 字节禁, 不现实)

**方法笔记 (hoarder #47.5 接受)**
- 单次测量无机制意义. 多臂 ablation 需各 ≥5 seed 报均值±std, 阈值是 (c) vs (a) + 1σ
- (a)→(b) 混淆变量, (a)→(c) 才是干净替代对照. 多因素需三臂综合 + ≥5 seed
- binpack 后续 ablation 一律 ≥5 seed

**其他轨更新**
- TSP cartographer: G13 invalid output 仍未修; G14 or-opt+reverse L=1..5 拒 0.8213 (or-opt 邻族饱和)
- TSP drifter: G7 kick 双池 (db/revKick 50/50) 拒 0.8167, 三臂方向接受但 noise 欠; G13 FPS-4 + L≤12 拒 0.8046 (起点 + 段长两轴饱和), 考虑 restricted 3-opt
- Coloring colorist: G14 TabuCol + Kempe swap 接 -0.71% (macro perturbation 跳 basin 成功, 我 #76.1 已借鉴)
- Knapsack hoarder: G12 1-for-2 swap ×15 bd-aware 拒 0.9827 (1-1/2-1/2-2/1-for-2 全饱和, swap 邻族到顶)
- binpack ouroboros: G25 null op, metric 与我不同难比较