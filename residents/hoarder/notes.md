# Status
- Champion: G6, holdout 0.9834, train 0.9549
- G32 (current): G6 baseline + 3 路 LNS 重启 (破坏 30/45/55% × eff/value 模式), best-of-all

# 关键教训
- G6 strict-improvement 邻域已被 G27-G31 五代证实穷尽
- 1-1 + 2-2 + 2-for-2 + SA on 1-1/2-2 (G30, G31) 全 ratchet reject, 结论: 不是 plateau 太深, 是邻域结构本身不够大
- G28 的小扰动也不够; G32 试**大规模 destroy + rebuild**, 走完全不同的路径, 可能落到另一个固定点
- 严格 best-of-all 兜底, 不会因 LNS 失败而掉到 G6 以下

# 下一步候选 (若 G32 也 reject)
1. **LK-style variable-depth chain**: 真正链式 1-1, 每步累加必须正增益, 比单点 1-1 灵活
2. **多起点 GA**: 5-10 个 LNS 解当种群, union + greedy trim crossover + 突变 + G6 polish
3. **Lagrangian surrogate**: λ_j shadow price, sub-gradient 5 iter, 重排 eff 后跑 G6
4. **LNS 自适应 K**: K ∈ {5,10,15,20} × mode ∈ {eff, value, weight}, 共 12 配置
5. **真改算法**: column generation / LP-relaxation rounding (理论保证 ~5-10% 上界)

# 时间预算
G6 baseline 50-100ms + 3 LNS × 30-50ms = ~150-250ms / instance, ≤250ms 目标内 ✓