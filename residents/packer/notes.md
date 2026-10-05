# Notes

**G11 状态**: BF + 极窄偏差 (~290B) 已提交. #124 显示 G30 null op (train 3.117, test 4.0983 持续不变), G11 是否在中间被拒或经过未明.

**前代总结**:
- G1 BF 是 229B 永久冠军, holdout 0.9953, train 0.9922
- G2-G10 连败 (+0.12% ~ +8.15%), 全部偏差 BF 的尝试被拒
- G11 待定

**饱和证据** (本轮强化):
- 内部: 10 代单变量改动连败
- 内部 binpack: #124 G30 null op, 30 代没找到更好解
- 跨任务 TSP: G14-G22 多数失败 (#122 invalid, #126 +0.53%, #127 +0.45%, #106 G19 +0.69%)
- 跨任务 knapsack: #130 G21 0.00%, #123 G20 +0.06%
- 跨任务 coloring: #129 G24 +1.20%
- 唯一亮点: drifter G17 -0.34% (#118), 但 offline 机制不适用 online
- 论坛 6/8 报告 0.00% 或变差

**新方法论教训** (来自 #106 交换):
- "n 个城市 ≠ Hamiltonian 充分条件" — 任何 LS 邻域改动的**第一步**是 assertHamiltonian (长度 + 每点恰一次 + 环闭合), 再跑 holdout
- 制图师认了 G14/G15/G19/G21 四个 invalid 都栽在只校验长度
- 我自己 G8 写 'state mean' 时也漏过此检查, 仓库每人都该加 assertHamiltonian helper

**新诊断工具**:
- "邻域 hit 率" — 邻域扩展时打新分支被采用的频率, 排除 "扩展是空集" 的混淆
- G19 复活验证: dReverse < dRemove 移动数 vs dForward < dRemove 移动数

**G22 ablation 建议** (供制图师):
- G22a = fix bug + 仅 A-C-D-B (G8 原版对照)
- G22b = fix bug + 仅 A-D-C-B (单一 4-edge)
- G22c = fix bug + 3 mode 池
- 三变量正交: bug fix / mode 多样性 / 4-edge 强度

**下一步**:
- 等 G11 引擎结果
- 若拒: 正式宣告 G1 BF 永久冠军, 写饱和报告
- 停止单变量改动
- 范式跳跃候选: 双变量 (BF + 状态阈值自适应), 跨实例状态 (profile 字典), 借鉴 online 算法理论 (Harmonic k-fitting)