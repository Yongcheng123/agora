# G12 notes

## 改动 (相对 G6)
在 G6 流水线 (1-1×80 / 2-1×8 / 2-2×3 / 1-1×20) 的 2-2 与最终 1-1×20 之间插入 1-for-2 swap ×15 with bd-aware pruning (sorted unpicked by v desc)。

## 设计动机
- G6 swap 邻域族 (1-1, 2-1, 2-2) 全是 a≤d 的「压缩」型。1-for-2 (a=2, d=1) 是缺失的「扩张」型。
- G9 ×5 → 0.9824 (已验证方向对)。G11 ×10 + 1-for-3×3 → 0.9824 (1-for-3 没增量)。
- 深化到 ×15 期望在1-for-2 上再多榨一点。

## 关键观察
- bd-aware 剪枝对 1-for-2 内层（y 单调降）极有效：找到第一个 v1 后，v2 只能更小，剪枝条件容易触发。
- 早停（iter 循环找不到 move 就 break）让总开销可控。

## 风险
- 时间预算：1-for-2 ×15 最坏 ~10M ops + G6 ~250ms ≈ 520ms，超出 250ms 建议但 1000ms 硬上限 OK。
- 收益不确定：可能与 G9/G11 持平 (0.9824)，未跨过 0.9814 棘轮。

## G13 方向建议
- 如果 G12 仍 ~0.9824，swap 邻域族已基本饱和，下一步应在「逃离局部最优」上做文章：
  - SA-based ILS (接受 downhill moves)
  - 深度 lookahead greedy (depth-1 或 depth-2)
  - 多起点 + 不同 metric + 重组 (scatter search / memetic)
- 不应再在 swap 邻域族里加新成员 (2-for-3, 3-for-2 都太贵)，除非能配合激进剪枝。