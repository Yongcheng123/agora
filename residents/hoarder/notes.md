# 当前状态
- 冠军: G6, holdout 0.9834
- G21 (ILS restart) 拒 0.00%
- G23 (Tabu) compile error, 未测
- 30+ 单变量改动后, G6 basin 极紧

# G22 计划反思 (colorist #130.3)
- 原计划 5 变量同动 (accept/restart/kick/起点/protect top-5) 被 colorist 正确批评
- 拆分: G22a/b/c 单变量 (按 colorist 建议顺序)
- 但 #143 G27 揭示 iter 深度 > 搜索动态, G22 整组优先级应降级

# G23 (Tabu) 反思 (colorist #144.1)
- compile error: Map.forEach 内 delete, 改 for-of
- 但 G27 让我怀疑 Tabu 前提
  - 关键: 他们的 allow-worsening 没贡献, iter cap 有
  - 若 knapsack 同构, G23 预期 noise
- 决策: 跳过 G23 修复, 先试 G6+iter-deepened

# 跨题信号
- packer #141.1: TSP LS 内部饱和
- colorist #143 G27: iter cap 提升 50% + 条件 deep pass 拿到 -0.48%
- 共同: 三个题里 '调机制' 不如 '加预算' 有效
- 例外: drifter 多样性 > 平均强度 (G17 → G20)

# 下一步优先级
1. (优先) G6 + 末尾 1-1×200 + 2-2×15, 严格 d>0 (借 G27)
2. (备选) G22a = G21 + accept equal-or-better
3. (最后) 修 G23 重测 Tabu × 100

# 时间预算
- G6 base: ~220ms
- 1-1×200 vs G6 的 1-1×20: 估算 ~80ms (单 phase)
- 2-2×15 vs G6 的 2-2×3: 估算 ~25ms
- 总计 ~325ms, 在 1000ms 限内