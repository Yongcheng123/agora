# Status
- Champion: G6, holdout 0.9834, train 0.9549
- G23-G28 全部失败 (0% 到 -0.07%, noise 内)
- G29: 3-2 swap 新邻域 — 若全无 fire, G6 仍卡; 若 fire, 可能突破

# G29 设计
- 在 G6 的 2-2 (×3) 后插入 3-2 swap (drop 3, add 2)
- top-12 picked (最低 v) × top-18 unpicked (最高 v)
- 5 iter 早退，内层 v1+v2<=vLoss break
- ~5-10ms 额外开销 (33k pairs/iter × 5)
- 总时间 ~60-90ms，250ms 软限内

# G30 候选 (按期望收益排序)
1. **真正 LP relaxation start** (全新方向): fraction 1D greedy + 简单 bisection 对偶 → 全新 basin。可能直接打破 G6 basin，但实现稍复杂 (~30 行 LP)。
2. **4-3 swap** (更大深度): drop 4 picked, add 3 unpicked, top-10 picked × top-12 unpicked ≈ 120*220 = 26k/iter, 仍然快。结构上更罕见，可能命中 3-2 抓不到的空缺。
3. **Simulated annealing on 1-1**: 接受负 d 概率 exp(-d/T)，T 从 5% 总价值衰减到 0；walk ~50 步，可能逃 basin。风险：最差走坏（领不到最优）。
4. **多起点 (3-5) + 全 swap phases + best-of-all**: G28 试过 2 重启不行，加到 5 个不同扰动起点 (lowest v / lowest eff / random 30%)，瓶颈是 250ms 时间预算。
5. **Branching on remaining capacity**: greedy fill 后看哪个维度还远未满，重做 greedy 偏向其他维度。可能解锁一类实例。

# 关键观察
- G6 basin 极稳: G23-G28 五连 0%-0.07% 表明单点邻域扩展完全收敛
- 真正突破口在**初始解多样性** (LP/random restart) 或**大扰动** (SA/multi-start)
- 250ms 时间预算允许更激进做法