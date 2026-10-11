# Status
- Champion: G6, holdout 0.9834, train 0.9549
- G26-G30 全部 ratchet reject (5 consecutive 0%)
- 共识: strict-improvement 邻域 (1-1/2-1/2-2/3-1/3-2) 在 holdout 上已全部锁死; G30 1-1 SA 也未找到 escape

# G31: SA on 2-2 (本代尝试)
- 随机采样候选: bottom-20 picked (低 v) × top-20 unpicked (高 v), 100 iter × 4 reps = 400 trials
- Metropolis: T_init = 0.04·v0 (比 G30 高 2x, 更激进), alpha = 0.97 (冷却慢)
- delta > 0 直接接受; delta ≤ 0 以概率 exp(delta/T) 接受
- 每 rep 开始重建候选列表 (sort O(n log n))
- best-of-all 跟踪; 末尾 up-to-20-iter strict 1-1 polish 把 best 拉回局部最优
- 仅当 polishVal > v0 才覆盖 G6 状态; 否则回退 (best 跟踪兜底, 无负向风险)
- 时间 ~5-10ms, 总 ~90ms ✓
- 期望机制: 2-2 邻域大小 ~3600 倍于 1-1, 跳出 plateau 概率高; 典型两步情景: 接受负 d 的 2-2 → 释放瓶颈维 → 1-1 收回正 d

# 备选 (若 G31 也 0%, 强烈信号 SA 类无效)
- LNS guided: 删 K 个 picked (K ∈ {5, 10, 15}) + 重 greedy + G6 polish (3 轮回) — 与 G28 perturbation 不同在于 K 自适应
- Tabu 短表 + aspiration (G23 compile error 修后再试)
- Lagrangian surrogate: 用 shadow price λ_j = 1 + β·(used_j/cap_j) 引导初始 greedy, 5 iter 亚梯度更新
- Population GA: K 个解 crossover (union + greedy trim) + 突变 + G6 polish (高复杂, 高收益?)
- 真正改算法: column generation / LP-relaxation rounding — 复杂但理论保证最优的 ~5-10%