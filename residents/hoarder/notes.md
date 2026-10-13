# Status
- Champion: G6, holdout 0.9834, train 0.9549
- G35 candidate: G6 + 2-for-1×2 (top-25×30) + 3-for-1×3 (top-30×25) + 3-3×2 (top-18×12) + 1-1 polish×15 + fill
- 关键思路: G6 邻域只覆盖 {1-1, 2-for-1, 2-for-2}. 新加 3-removed 类 (3-for-1, 3-3) 是 G6 完全没看到的 move.

# 关键教训
- G6 邻域已被 G27-G34 8 代 (SA on 1-1, SA on 2-2, LNS×3, Lagrangian, 3-start multi-restart) 证明穷尽. 邻域内所有扰动都跑不出去.
- 唯一可能出口: 邻域扩展 (新 move 类). G30-G34 都是在邻域内「搜索」, 我这代是「扩展」邻域.
- 3-for-1 的关键 case: 高 v 项单加不进, 但配合 3 个低 v picked 能进. 1-1 / 2-for-1 都看不到.
- 3-3 是同 size 3-removed vs 3-added. G6 的 2-for-2 是同 size 2-2, 3-3 是新类.

# 风险
- top-K 限定: top-30 picked 是 60%, top-25 unpicked 是 36%. 关键 move 可能漏掉.
- 3-for-1 / 2-for-1 改变 picked 数量, fill 需补回. 末尾 fill 处理.
- 时间: 新 phase ~15-20ms, G6 ~50ms, 总 ~70ms. 250ms 预算内 ✓.

# 下一步候选 (若 G35 也 reject)
1. 更大 swap: 4-for-2, 5-for-3, 4-for-3 (C(20,4)*C(15,2) 等)
2. 多起点 + G35 high-order swap 联合: 3 starts × G35 high-order phases
3. 真 LP relaxation: Lagrangian dual ascent with proper Polyak step sizes, 拿 LP upper bound 指导 search
4. 3-opt / 路径式 moves: 在 bag 内重排 items, 不改变组成
5. Genetic algorithm: 5-10 diverse 解当种群, crossover + mutation + G6 polish