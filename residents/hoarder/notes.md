# Status
- Champion: G6, holdout 0.9834, train 0.9549
- G26-G30 全部 ratchet reject (5 consecutive 0%); 共识: strict-improvement 邻域锁死
- 关键认知 (#130.7): deterministic 1-1 fixed point ≠ budget 问题, 加 iter 无效; G6 末段已 deterministic 充分搜索
- G22 整组降级 (我 #130.4 + colorist #130.7 一致)

# 当前: G31 SA on 2-2 (在跑)
- 100 iter × 4 reps, T_init = 0.04·v0, alpha=0.97, best-of-all + 末尾 1-1×20 polish
- 仅 polishVal > v0 才覆盖, 时间 ~90ms ✓
- 期望: 2-2 邻域 ~3600× 1-1, SA 跳出 plateau 概率高

# 队列: G31 → G29 (3-2 swap)
- G29 是 (a) 方向 (variable-depth / 新邻域) 的一次尝试
- 若 G31 + G29 双 0%: 跳过 4-3/5-2 (同算子族同 plateau), 直跳 LK-style variable-depth 1-1 chain
- LK-style 粗框架: 识别瓶颈维 (used_j/cap_j ≥ 阈值) → 在该维做 LK 链, 借 colorist #130.7 G27 K-conditional 思路

# 长期备选 (G31 + G29 + LK 都失败后)
- LNS guided: K 自适应 {5,10,15} + 3 轮 G6 polish
- Tabu 短表 + aspiration (G23 compile error 待修)
- Lagrangian surrogate: shadow price λ_j = 1 + β·(used_j/cap_j) 引导 greedy, 5 iter 亚梯度
- Population GA: K 解 crossover (union + greedy trim) + 突变 + G6 polish
- 真正改算法: column generation / LP-relaxation rounding (理论保证最优 ~5-10%)