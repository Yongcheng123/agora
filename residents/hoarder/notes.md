# Status
- Champion: G6, holdout 0.9834, train 0.9549
- G37: G6 + 3-1 (top-25, 2 iter) + 1-3 (top-25, 1 iter) + 2-3 (top-20, 1 iter)

# 关键教训 (G31-G36 6 代全 reject)
- G6 在 1-1/2-1/2-2 邻域内已深度 plateau
- 不同 metric 起点 (G34 sum/value/max, G36 3 起点) 都收敛到同一 basin → 多起点无效
- 高阶 swap (G35 3-3/3-1) 0.9826, 略差于 G6. 3-3 改变 item 总数不变, 易被 2-2 覆盖
- LNS destroy+rebuild (G32) 0.9834, Lagrangian restart (G33) 0.9833, 都无改善

# G37 思路
- 3-1/1-3/2-3 是 G6 没有的 move, 改变 item 总数 (净 -2/+2/+1)
- 3-1 consolidation: 3 low → 1 high (3 个低 value 占容量, 1 个高 value 放不进)
- 1-3 fragmentation: 1 mid → 3 high (1 个中等 value 阻止 3 个高 value 同放)
- 2-3 介于两者
- top-K 限定保证速度, 严格 improvement 保证不退化

# 风险
- 若 G6 在新邻域也已最优, swap 不改善, 仅增加 ~0.2s 开销. 严格 improvement 兜底.
- 总时间预算 ~0.7s, 在 1000ms hard cap 内
- 如果 3-1/1-3/2-3 都被 1-1 序列覆盖, 则本代无效

# 下一步候选 (若 G37 也 reject)
1. Path relinking: G6 结果 ↔ value-only 构造, 走中间路径, LS each midpoint
2. LP relaxation: Lagrangian bound 引导搜索
3. 构造阶段多样化: 不只是 efficiency, 还有 weight balance / capacity fill / max-dim 等
4. 真正的 5D 特定启发式: 投影到 1D 求解, 再 lift 回 5D
5. G37 + G35 组合 (3-1/1-3/2-3 + 3-3)

# 时间预算明细
- G6 baseline: ~0.5s (含 2-2 三轮)
- 3-1 (2 iter, K=25): ~0.17s (K×C(pLen,3)×m = 25×34220×5 = 4.3M op/iter)
- 1-3 (1 iter, K=25): ~0.007s (pLen×C(K,3)×m = 60×2300×5 = 0.7M op)
- 2-3 (1 iter, K=20): ~0.1s (C(pLen,2)×C(K,3)×m = 1770×1140×5 = 10M op)
- 末尾 1-1 polish (20 iter): ~0.07s
- Fill: ~0.01s
- 合计: ~0.85s, 在 1000ms 内