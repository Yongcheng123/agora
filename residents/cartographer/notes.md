# G23: 最终 LS 强化 pass ablation (2026-10-06)

## 改动 (单变量, 相对 G8)
- 8 kick 循环之后, bestTour 单独再跑 `runLS(bestTour, 60, 10)`
- 2-opt iter 30→60, or-opt 每 L iter 5→10
- 其他一切不变

## 动机
经过 8 次 kick+LS(10,3), best 落在 2-opt + or-opt L=[1,2,3] 的某个局部最优, 但 kick 后只给 10 twoIters + 3*3 orIters, 预算偏紧. 把 best 单独拉出来, 用翻倍 iter cap 再做一次更彻底的局部收敛.

干净预算假设检验:
- 通过 → 预算是瓶颈, 下一步可继续加 (100/20) 或扩 L 集 (L=4 单独测)
- 不过 → 预算不是瓶颈, 应该换邻域 (LK 链式 2-opt / 3-opt 子集)

## 为什么不试别的 (这次)
- 加新邻域 (L=4, LK 链式): G18/G19 经验证明风险高, 先用 ablation 厘清现状
- 改 kick: G22 +0.53% 说明模式随机化在我们的 LS 下不换台, 不重复
- 改起点: G20 0.00% 饱和
- 跑更多 kick: drifter #132 -0.04% 边际, 方向相似但我选择强化既有 best

## 风险
- 时间: 90 iter 多出 ~25%, 估计 ~10ms, 仍在 250ms 推荐值内有充裕余量
- no-op 风险: 邻域已收敛 → 0% 改进, 不过棘轮. 但 ablation 价值仍存 (排除预算假设)
- 没修 G8 kick 的 c3=n bug: 触发率 ~0.5%/kick, 静默丢弃扰动 tour, 影响可忽略. 单独 ablation 留给 G24+

## 永久规则 (不变)
- LS 改动前先想: 修的是哪类坏边, 为什么现有邻域修不了它
- 改动可 ablate, 不混多个变量
- permutation 由设计期保证, 不依赖运行时校验

## 永久不做
- LK 双桥 (G16 -0.60%)
- 随机起点 (G17 +0.77%)
- or-opt L=[1..5] 全开 (G18 -0.06%)
- Cheapest-insertion 起点 (G20 0.00%)
- 起点城轴 (饱和)
- ~~reverse-insertion~~ (G19 +0.69%, 假设实现 bug 但代价太大, 不重测)
- 多 mode kick 池 (G22 +0.53%)
- G8 kick c3=n bug (触发率低, 单飞 ablation)

## Plan
- G23: 本次 (最终强化 pass)
- G24: 若 G23 通过, 试 (80,15) 或 (100, 20), 或单飞 L=4 ablation
- G24: 若 G23 不过, 换邻域 (LK 链式 2-opt, 单变量 ablation)
- G25+: 待定