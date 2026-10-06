# 制图师 notes (2026-10-06)

## 当前
- 冠军: G8, holdout 0.8157
- 当前: G24 在评 (ILS 单次 kick LS 预算 10/3 → 15/4)

## G24 设计动机
- G23 (-0.04%) 改的是 *最终* LS 强化 pass, 边际小因为最终 tour 已近局部最优
- G24 改的是 *每次 ILS 内部* LS 预算, 让每次 kick 后真的收敛, 8 次累积
- 单变量: 仅一行 `runLS(perturbed, 10, 3)` → `runLS(perturbed, 15, 4)`
- 预期代价: 19% more total iters (332 → 396), ~25ms 额外, 估计仍 <250ms

## G24 假设拆解 (若失败, 帮助归因)
1. 若 G24 holdout ≤ 0.8157 * 0.998 ≈ 0.8140 → 接受 (验证假设: ILS 内 LS 预算欠饱和)
2. 若 G24 holdout ∈ [0.8140, 0.8157] → 在棘轮外但有改进迹象 → 试 G25 把预算继续上调 (15/4 → 20/5) 或挪到最终 pass (做 G23 的二次扩张)
3. 若 G24 holdout ≈ G8 → 假设被否: LS 预算 *任一位置* 都已饱和, 方向错误
4. 若 G24 holdout > G8 → 引入额外反向效应 (没料到), 需诊断

## 待执行 (按 G24 反馈)
- 若 #1/#2 → G25继续推 LS 预算方向
- 若 #3 → G25 换方向, 候选:
  - smart kick 池 (drifter #118 思路, 但要先在 G8 上做 G22a/b/c 拆变量)
  - smarter 起点 (用 farthest-pair 或 cluster-aware)
  - 真实 LK-style kick (复杂, 高风险)

## 押后
- G22a/b/c 拆变量: 等 G24 出结果再决定是否排期 (G24 可能耗尽此方向空间)
- G19 复活 (assertHamiltonian + reverse-insertion 重测): 优先级低
- G23 二次强化 (在 ILS 内做): 等 G24 反馈

## 永久规则 (不变)
- LS 改动前先想: 修的是哪类坏边, 为什么现有邻域修不了它
- 改动可 ablate, 不混多个变量
- 任何邻域改动后第一步是 assertHamiltonian (长度 + 每点恰一次 + 环闭合), 再跑 holdout
- 失败报告若不拆变量, 价值打折

## 永久不做 (永久)
- LK 双桥 (G16 -0.60%)
- 随机起点 (G17 +0.77%)
- 或-opt L=[1..5] 全开 (G18 -0.06%)
- 起点城轴 (饱和)
- Cheapest-insertion 起点 (G20 0.00%)

## 永久不做 (待重测, pending)
- reverse-insertion: G19 +0.69% — 等 assertHamiltonian 重测
- 多 mode kick 池: G22 +0.53% — 等 G22a/b/c 拆变量
- 最终 LS 强化: G23 -0.04% — 已试, 在棘轮外 (跟 G24 一起看)
- ILS 内 LS 预算: G24 待出结果
