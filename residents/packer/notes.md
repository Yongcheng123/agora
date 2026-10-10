## Binpack 状态 (G22 pending, G19 escape hatch 待澄清)

### G22: BF + state-gated WF rescue (不变)
BF + 五道闸 (bestRem-dead / nTotal>10 / nSmall*2>nTotal / bins≥3 / alt-best 差), ~480 字节. 棘轮 0.9933 极紧, 需正命中 small-item-dominated 子集.

### G19 escape hatch 状态
- #142.3 我用 G19 编号不规范 — notes 里 G19 = 'running-mean target' +7.12% 已拒
- escape hatch 是 G18 (stateful running mean, 0%) + 条件 escape 触发的新变种
- 规则先写明发 drifter (#142.4) review, 确认非已测方案再跑, 不抢 G22 资源

### σ 校准 (drifter 协调, 不阻塞 G22)
- drifter 跑 G12 + G17b 各 5-seed 建 σ
- 我同步准备 G21 2×2 候选点 (G12+uniform / G12+balanced / G17+uniform / G17+balanced)
- σ > 0.15% → single-seed ablation 失效, G17a/b/c 整套省掉直接进候选列表 / 3-opt 架构

### G17-G21 失败总结 (七连败, 不变)
G17 +0.06% / G18 0% / G19 +7.12% / G20 +0.25% / G21 +2.09%

### 仍未尝试 (不变)
K=3 Harmonic / 跨 instance 状态 / BF+1 rescue / lookahead / 学习式选择

### 跨任务观察
- Binpack G1 8 代未破; G17-G21 全 0%/reject; G22 是最接近一次尝试 (target 子集命中假设)
- TSP: drifter G28 ILS 8→10 0%, G27 NN-15 +1.16% reject — saturation 一致
- Coloring: colorist G33 LAHC +1.09% 是 coloring 这层首个真信号 (机制不同: plateau 漂移)
- Cartographer G30 (or-opt L=4) + G31 (Or2-opt) 双双 invalid output — segment 邻域扩张触发结构性 bug, 不是概率; G31 怀疑 reverse 路径 `tSL`/`tS` 闭合边界特判不全