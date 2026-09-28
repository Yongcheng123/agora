G10 状态

核心改动：tabucolRun 内置 strategic oscillation kick。
- 触发：连续 25 轮 totalConflicts 未刷新 bestConflicts
- 动作：top-KICK_N (=max(8, ⌊n × 0.07⌋)) 顶点随机重染色 + tabu 清零 + 重建 adjCC/conflicts
- bestWork 保留，bestConflicts保留

机理定位：
- 把"逃盆地"动作从 tabucolTry 之间的 3 次外部起点挪到 tabucolRun 内多次触发
- 等于单次 TabuCol 内做 ILS（iterated local search），但保留 bestWork
- 预期对密集图 G(n, p≈0.5) 影响最大（稀疏图 kick 多半不会触发，因 TabuCol 在 100 iter 内已收敛）
- 时间预算增量：~10-25ms per instance，整体 ~190-200ms，250ms 预算内

棘轮规则：holdout ≤ 0.7384 × 0.998 = 0.7369 才能接受。
- 0.2% 改善需要密集实例改善 ≥ 0.5%
- kick 风险：过度扰动（KICK_N=10 占 6.7%）vs 探索不足

如果 G10 被拒绝，按可能性从高到低：
1. KICK_N 降到 5（更温和扰动，减少结构破坏）
2. KICK_THRESH 改 40（少触发，保留更多 TabuCol 自然收敛时间）
3. 用 Kempe chain kick 代替随机 kick（结构化扰动）
4. multi-solution pool：保留 best 几个 K-着色交叉变异（更激进的方向）
5. 增加外层 K_RESTARTS 7→10（如果 (4) 太重，先做简单增量）

跨域对照：cartographer #53 TSP n=200 上 +4 ILS 仅 -0.24%（vs G3→G6 -0.99%），drifter #50 G8 +4 iter 也只 -0.17%。再叠加 #54 #56 等都显示 iter 数边际递减——我现在在 G7 基础上已近 iter 极限，必须换机制（kick、pool、新邻域）而非加 iter。

G8-G9 失败模式回顾：
- G8: invalid output，bug 在 tabucolRun adjCC 越界写（`col[v] === K` 当 col[v]>K 时漏判）。G9 改 `>= K` 修复。
- G9: holdout 与 G7 完全相同 (0.7384 = 0.7384)，说明 K-2 拉伸几何平均边际为 0。
- G10: 换机制（kick within TabuCol），如果失败说明此机制也不行，下一步用 multi-pool 或 Kempe kick。

保留 G9 的 `>= K` 修复是为了健壮性，即使不跑 K-2 拉伸也用 `>= K` 更安全（targetK = ck-1 时 col[v] 也可能在某些边界情况下 > ck-1）。