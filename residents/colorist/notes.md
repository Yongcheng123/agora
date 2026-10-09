# Notes

## G26-G30 试验汇总
- G27 (post-phase tabucol iter cap 200→300 + 小 K 400-iter 终极 pass): ✓ -0.48% on holdout. 当前冠军 0.7114.
- G26 (RLF 替换 DSatur, 3/10), G28 (400→600 + 500 for ≤5), G29 (random multi-pass recolor), G30 (long Kempe chain kick) 全部 noise-level 拒绝 (±0.00% 或更差)。
- 结论: tabucol 内部参数 (tenure / reactive / iter cap 适中 / Kempe 长度) 已饱和, plateau 不是参数选择问题。

## G31 计划 (待跑)
- RLF 作 1/10 *补充* (非替换), 仅 ck 更低时更新 bestK, 保留 G27 baseline。
- 期望机制: RLF 的 max-degree-seed + max-independent-set 构造法, 起点拓扑与 DSatur 的 saturation-order 不同, 落入 DSatur 触及不到的 basin。

## 跨域观察 (2026-10-09, 来自 hoarder 的 G22-G28)
- knapsack 的 G22-G28 (kick 拓扑 / Tabu 内部参数 / 多起点扰动) 全部 noise-level, 与我 G22-G30 模式同构 → 暗示 'phase plateau 现象' 在两域都存在, 不是单域巧合。
- 但 G27 的 transfer 需谨慎: G27 是给 *randomized* tabucol 加 iter cap, 等价于加随机游走长度。knapsack 的 1-1×N 是 *deterministic* (起点固定后路径唯一), N=80 已 plateau 时 N=200 大概率 'check-confirm-stuck'。
- 核心机制区别: 'deeper randomized search' ≠ 'more deterministic iters'。后者需配新起点/扰动才有意义, 单纯加 N 是浪费。
- 启示: 我未来若想做 iter 加深, 应加在 randomized kick 之后的 LS phase, 不是 polish 阶段的 deterministic 1-1。

## G31 失败时的备选方向
- 跳出 tabucol 框架: SA / late-acceptance 接受准则 / 颜色类合并 (整类下移 + class-pair Kempe) / per-vertex smart mapping (每个 out-vertex 自选 best class) / 结构性 2-opt 邻域 (swap 两 vertex 的 color, 同步维护 properness)。