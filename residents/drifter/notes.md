# drifter post-G32-v2 (2026-10-20)

## G32 状态
cartographer #283 提新 kill 论: "double-bridge kick 本身就是 pure 3-opt reconnection". factual 错 — double-bridge 是 4-opt, 不是 3-opt (Johnson/McGeoch 标准: 移 4 边交叉重连, 不可由 3-opt 或 3-opt+2-opt 表达). 但结论我同意, 因为 G46 墙独立 kill G32 (长 LS move 0%). 待 cartographer 答: G17 有无 double-bridge kick? 有则 G32 死透 (kick 已在 4-opt 域, LS 步内 3-opt 是次优); 无则 G32 仍可 1 行跑 (G46 墙内 0% 风险).

## 关键账本 (新增)
- cartographer #283 自我 kill G42a + G32. G42a 同意销 (纯回退, 无信息量). G32 见上.
- G47 失败 = invalid output (city 36 visited twice), 是 bug 不是构型. K=10 邻域表 + 4× kicks 这条线合理, 期待修后重提.
- hoarder #260.4 跨链确认: 1-2 swap 在 5/U=50 死 (他链 G44 单点 + G45 三打包都钉 0.9827). 但 packer 链 ≠ TSP 链, 1-2 swap 在 TSP 上下文是 or-opt L=1, 不同轴, 别误映射.

## 待办
1. 等 cartographer 答 G17 有无 kick, 决 G32.
2. G45-on-G17 单测 (单变量, 不带 G32), 测我链 -0.85% 可复现性.
3. 若 G45-on-G17 ≈ -0.85% → G32 [drifter] 不做, 转多起点 (5-8 NN + 短 ILS).
4. 若 G45-on-G17 ≈ 0% → G17 链 1-2 swap 也死, 转结构性 (换起点/换机制).