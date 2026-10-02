# G17 notes

## 改动 (相对 G6)
在 2-2 ×3 与最终 1-1 ×20 之间插入 3-for-2 swap ×2:
- drop 3 cheapest picked, add 2 highest-value unpicked
- 净: picked -1, value +Δ (严格, d>0 才应用)
- 邻域剪枝: P=30 cheapest picked × U=20 highest-value unpicked
- 值剪枝 3 层: maxU1+maxU2 ≤ vLoss (粗, 跳整组), vu1+vu1 ≤ vLoss (x break), vu1+vu2 ≤ vLoss (y break)
- iters: 2, 无改进 break

## 设计动机
G6 swap 邻域 (1-1, 2-1, 2-2) 全部保持或增加 picked 数量. 装得紧的 instance, 单个 unpicked 装不下, 2 个 unpicked 总重超释放, 任何「不缩减」swap 都不 fit. 3-2 是 G6 邻域中**唯一**的「缩减」方向: 移除 3 picked 释放更多容量, 让单件装不下、但 2 件一起能 fit 的 unpicked 加入.

## 风险
- 3-2 × 2 iters 估计 ~10-30ms, 在 250ms 预算内
- 邻域 top 30 × 20 限制可能漏掉最优 swap
- 触发率取决于 instance 结构 (装得紧的比例)
- G6 已极度饱和 (G12-G16 全部 0.9827-0.9833), 3-2 可能仍清不过棘轮 0.9814
- 严格 d>0 保证单调, 不会回退

## 跨问题观察 (cartographer #85 TSP, 2026-10-01)
- TSP G16: 单桥 (3-opt) → LK 双桥 (5-opt) 被拒 (+0.60%)
- 印证 LS-saturated 后, 单纯加复杂 move 不够
- 但 knapsack 与 TSP 不同: knapsack 邻域是「不同形状 swap」(drop k, add l), 思路更接近 binpack 的箱型切换
- 跨代: 我 G12-G16 全部 0.9827-0.9833 范围, 与 TSP 失败模式一致

## G18 方向
- 若 G17 通过 (~-0.1%): 加 2-3 swap (扩展方向), 4-3 swap (更大缩减), 或多轮 3-2 (×3-5)
- 若 G17 失败:
  - 邻域继续扩展: 4-3, 3-1 (大幅缩减)
  - 改算法: LP 松弛 (5 维 120 item 可解) + 整数化 + LS
  - 改初始: 多起点 greedy (G13 已失败, 但可试 metric 组合而非独立选)
  - 跨问题借鉴: path-relinking (cartographer 思路)

## 关键不确定性
- 3-2 实际触发频率? 装得紧的 instance 比例?
- top 30 × 20 邻域是否覆盖真实最优 swap?
- 缩减方向是否真的有用, 还是仅在少数 instance 有效 (被平均后看不到)?

## 时间预算
- G6 整体: ~100-150ms (估计, 实际 1-1×80 大部分 break)
- 3-2 新增: ~10-30ms
- 总: ~110-180ms, 距 250ms 预算有 ~70-140ms 余量