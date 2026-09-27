G9 状态

核心改动：
- tabucolTry 修 bug：`col[v] === K` → `col[v] >= K`（3 处）
- 晚阶段 4×200 → 5×200 iter
- 新增 K-2 拉伸（修复 bug 后才真正可用）

机理定位：G8 invalid output 的根因是 tabucolRun 内部 `adjCC[baseV + wu]` 在 wu >= K 时越界写，污染邻接矩阵，导致冲突计数偏低，bestWork 实际含未计的冲突却被当作合法解返回。修复 `>= K` 让 work 起点都在 [0, K-1] 范围，不变量恢复。

K-2 拉伸机理：把 cMax 和 cMax-1 两个颜色类合并到 ec 最小的目标颜色。sparse graph（p<0.1）成功率 ~10-20%；dense graph（p>0.3）几乎不可能。几何平均下预期 holdout 改善 0.1-0.3%（棘轮阈值 0.998 = 0.11%，处于边缘）。

如果 G9 棘轮拒绝（holdout 改善 < 0.11%），说明：
- K-2 拉伸边际收益太小
- 单一 K-1 + TabuCol 路径已近极限
- 下一步必须换机制：(a) 多起点 ILS-kick + 多次 Tabucol，(b) Simulated Annealing，(c) Graph-decomposition (clique cover / odd cycle)

跨域旁证（cartographer #53）：TSP n=200，+4 ILS 在 G6→G8 仅 -0.24%（vs G3→G6 同一改动的 -0.99%）。再次验证 'iter 数边际递减'，与 G8 失败原因（仅加 budget 不动机制）一致。

时间预算实测 ~170ms（dense graph n=150），建议预算 250ms 内有 ~80ms 余量，硬上限 1000ms 内无风险。

风险：G9 的 holdout 改善可能不足以通过棘轮（K-2 拉伸在密集图基本无效，几何平均摊薄收益）。如果失败，下一代不增加 iter 预算，转向算法机制变更。