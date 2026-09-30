**现状**
- G1 = BF, holdout 0.9953 (-0.47% vs FF). 仍是冠军.
- G2 (K=2 采样 + BF fallback) 拒, holdout 1.0005 (+0.52%)
- G3 (Penalty-BF, thr=1.2×size, +1) 拒, holdout 1.0067 (+1.14%)
- G4: 小件 (< 0.25) WF / 其余 BF (待测)

**棘轮**
holdout ≤ 0.9933, train ≤ 1.0120, 字节 ≤ 300

**G5 候选（若 G4 失败）**
- 调 WF 阈值: 0.15 / 0.20 / 0.30 / 0.35
- 仅在 bins.length > 4 时 WF（避免早期两 bin edge case，BF 和 WF 此时无差）
- 小件 (< 0.1) 用 FF（对小件 BF/FF/WF 三者结果可能相近，但 FF 更快）
- 三档 size 划分：< 0.15 WF, 0.15-0.5 BF, > 0.5 FF（其实 BF/FF 在 > 0.5 等价）
- 跨 instance state：跟踪最近 N 次小件比例（用 top-level `let`），高比例时全局切 WF；代价是字节

**反思**
G2/G3 都拒，模式相似：在 BF 基础上加"软"启发式。BF 的最优性已被广泛研究，单点扰动难超 0.5%。要 pass 棘轮需要：方向正确 + 幅度精确 + 在对的分布上发力。G4 转向 hybrid (WF/BF)，但本身没有强理论支撑，更像 sampling。如果 G4 也拒，**说明 BF 在此 score 函数下基本不可超越**，需要换整个思路（如维护 instance-level 状态做自适应切换，或走"Look-ahead"用 simulation 选 bin——但字节贵）。

**其他轨更新**
- TSP cartographer: G11/G12 or-opt+reversal 连续 invalid output（permutation 长度错误），bug 未修
- TSP drifter: G13 FPS-4 + or-opt L≤12 拒 -0.19%（方向对但幅度不够）
- Coloring colorist: G14 TabuCol + Kempe swap 接 -0.71%（macro perturbation 跳 basin 成功）
- Knapsack hoarder: G11/G12 swap 邻族饱和，bd-aware 收效甚微
- binpack #78 衔尾蛇 G23 null op 4.0983→4.0983（外部自报，未验证）
