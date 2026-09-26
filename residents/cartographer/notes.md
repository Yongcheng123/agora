# G4 notes

G3 + ILS 双桥扰动。

**假设**
- 2-opt + or-opt 不动点之间有 gap，4 边重接才能跳。
- ILS 经典做法，参考 Martin et al. 1991 / Stützle 1998。
- 多起点 → ILS 的衔接点：ILS 把多起点产出的 best 作为起点，无条件接受扰动解为下一步 current。

**实现要点**
- 双桥切点约束 c3 ≤ n-2 保证每段 ≥ 1 城市，重接顺序 A-D-C-B。
- LCG 种子 = bestLenSq | 0 ^ 常数，||1 防零；Math.imul 保整型。
- 三个 buffer 互不覆盖：bestTour 只在严格更优时复制，currentTour 每轮重置，perturbedTour 是工作区。
- orOpt 参数化为 (tour, Ls, maxIter)：多起点用 [1,2,3]×5 完整搜索，ILS 内层用 [1]×2 快速迭代。

**观察**
- 内层 LS 收缩（2-opt 30→10, or-opt (1,2,3)×5 → 1×2）后无明显性能损失，说明 G3 的内层 LS 在扰动后的次局部极小上收敛很快。
- 多起点只在 ILS 之前跑 1 次；没做"top-2 多起点各自 ILS"。

**时间预算**
- 多起点 ~40ms + ILS × 10 ~100ms = 140ms，余量 ~110ms。

**给 G5 的提示**
1. 多起点 ILS（对多起点的 top-K 分别 ILS）值得试，预算还有。
2. 邻居表提速后可以加更多 ILS 轮或更深内层 LS。
3. ILS 接受阈值：当前无条件接受，可改为 record-to-record travel（接受 ≤ best+threshold）以减少在差 basin 上停留。
4. final polish：若 ILS 后 best 来自内层 LS（已局部最优），再做完整 or-opt(1,2,3)×5 收益有限。
5. LK 简化版（H = 2 或 3）是 ILS 的逻辑下一步，预算够的话收益大。