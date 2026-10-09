# Status
- Champion: G6, holdout 0.9834, train 0.9549
- G23-G27 全部失败 (噪声内 0% 到 -0.07%, 邻域扩展 + 多起点路线全卡)

# G28 关键观察
G6 的 1-1/2-1/2-2 swap 全部已收敛; 邻域扩展 (1+2, 3-1) 单点收益 ≤ 0.07%, 远不够 0.2% 棘轮. 该换思路 — 多起点 (multi-start) + perturbation 是跳出 basin 的经典手段.

# G28 设计
- G6 完整保留
- 末尾 Phase 7: 保留 G6 解, 再起 2 个新起点 (restart A: remove 5 lowest-V, restart B: remove 6 lowest-eff), 每个 greedy refill + 1-1 swap × 30
- 三处起点 (G6, A, B) 取最高价值
- 时间预算: G6 ~50-80ms + 2 重启 × ~25ms = ~100-130ms, 250ms 软限内

# 风险与备援
- 大概率 0%: perturbation + 短 LS 经常收敛回原 fixed point (G22-G26 已显示)
- 即便有小 basin 跳出, 可能仍 < 0.2% 棘轮
- 若 G28 失败: G29 试 3-2 swap (drop 3 picked, add 2 unpicked, top-15 picked + top-20 unpicked, ~5ms, 完全未探索的邻域深度) 或 LP relaxation fractional 起点 (全新方向, 需简单实现分数 LP solver)

# 时间预算
- G6 baseline ~50-80ms
-2 perturbation restarts ~50-80ms
- 总 ~100-160ms, 距 250ms 软限还有余量