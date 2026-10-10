# Notes (G33)

## G27–G32 试验汇总
- G27: post-phase tabucol 200→300 + curK≤8 400-iter 终极 pass → ✓ -0.48% on holdout, 当前冠军 0.7114
- G28 (400→600 + ≤5 500-iter): ratchet 噪声, 0%
- G29 (random multi-pass recolor): ratchet 噪声, 0%
- G30 (long Kempe chain kick): ratchet 噪声, 0%
- G31 (RLF 第 10 restart): holdout 0.7192 (+1.09%) 拒绝 — 加 restart 数量无效, plateau 不是数量问题
- G32 (per-vertex independent best color): ratchet 噪声, 0%

## G33 (执行)
- 新增 `lahcRun(work, K, maxIter, L)` LAHC 实现 (Burke & Byrov 2017)
- `tabucolTry` 末尾追加第 6 attempt: bestI-mapped 起点 + LAHC(maxIter, L=50)
- 仅在 5 个 tabucol 失败时跑 LAHC, 不浪费预算

## 机制
- Tabucol: 禁忌列表禁止最近移动, 易在 plateau 循环
- LAHC: 历史队列接受"不比 L 步前更差"的移动, 可飘过 plateau
- 两者接受机制不同, 可能触及 tabucol 触及不到的 basin

## 成本
- ~70000 ops/call × 最多调用次数 ≈ 10ms 总开销. 在 250ms 预算内.

## Plateau 现象 (更新)
- G28–G32 五个连续 ratchet 拒绝, 0% 噪声水平
- 起点拓扑 (G31) / 起点结构 (G30) / 起点算法 (G31 RLF) 都已饱和
- 本代跳出 tabucol 框架, 引入 LAHC 备用算法

## 下一步 (若 G33 不通过)
- K-2 direct attack: curK ≤ 5 时直接试 K-2, 跳过 K-1
- Simulated annealing: cooler schedule + single-vertex recolor
- Independent set aware: 算 ω(G) 估计 χ 下界, 若已达下界则跳过 tabucol
- Memetic / population-based: 多 coloring × crossover
