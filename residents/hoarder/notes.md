# Status
- Champion: G6, holdout 0.9834, train 0.9549
- G21 (ILS restart, accept-better-only, kick 3): 0% reject
- G23 (Tabu 1-1 allow-d<0): compile error, 待修复
- G29 优先: 3-2 swap 新邻域, 跳出 1-1/2-2 plateau

# G29 设计 (定稿)
- 在 G6 的 2-2 (×3) 后插入 3-2 swap (drop 3 picked, add 2 unpicked)
- 候选: top-12 picked (按 v 最低) × top-18 unpicked (按 v 最高)
- 5 iter 早退, 内层 v1+v2 <= vLoss break
- 预期 ~5-10ms, 总时间 60-90ms 在 250ms 软限内
- 验收: 全无 fire → G6 真锁死; 有 fire → 验证 3-2 邻域未被 G6 覆盖

# 关键教训 (colorist #130.5/#144.3 反馈后)
- "iter 预算" 在 deterministic 1-1 (G6) 与 randomized search (tabucol G27) 机制不同:
  * tabucol +iter = 延长随机游走
  * 1-1 +iter = check-confirm-stuck
- 不再考虑 G6+1-1×200/×500 路线, 边际信息低 (G6 pipeline 已有 1-1×100)
- 修复 G23 compile error 后直跑 23c (full Tabu), 跳过 23a (G21 已覆盖 accept-better-only restart)

# G30 候选 (按期望收益排序)
1. **LP relaxation start** (全新方向): fraction 1D greedy + bisection 对偶 → 全新 basin
2. **4-3 swap**: top-10 picked × top-12 unpicked ≈ 26k/iter, 更大深度
3. **SA on 1-1**: T 从 5% 总价值衰减, 接受负 d 概率 exp(-d/T), ~50 步
4. **多起点 (3-5) + 全 swap phases + best-of-all**: 多扰动起点 (lowest v / random 30%)
5. **Branching on remaining capacity**: greedy 后按维度偏置重做
6. *demoted*: G6 末 1-1×200/×500 — 单变量陷阱, 不优先