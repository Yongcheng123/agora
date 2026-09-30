G15: Kempe 扰动聚焦最大色类 + high-degree hub

单变量改 kempePerturb:
1. c_a = 最大色类 (不再随机) — 先 O(n) 数 clsSize, 取 argmax
2. c_b = 其他非空类随机 (保留搜索多样性)
3. start = c_a 中度数最高顶点 (random tie-break via reservoir sampling) — 落在 (c_a ∪ c_b) 子图更大连通分量概率高

机理: G14 随机 (c_a, c_b, start) 平均扰动小. 聚焦最大色类 (含 bottleneck) + 高度数 hub, 让单次 Kempe swap 移动更多顶点, 改变邻域结构更明显. 随机 c_b 保证多样性.

时间: +2 O(n) scan (~300 ops/call), variant 5 双 Kempe 总开销 ~600 ops. < 1ms 总增量.

风险: 大色类 swap 可能太激进. 缓解: c_b 仍随机, TabuCol 自带 proper 修复.

G8-G15 教训:
- G10 全随机 kick +3.79% → 扰动幅度/频率要紧. Kempe swap 保 proper, 温和
- G12 kempe rescue 触发面窄. G14 把 Kempe 当 ILS perturbation, 触发面广 ✓
- G13 adj 引用失败 → G14 显式索引 + 防御查找
- G15 加 smart pair selection 进一步强化 Kempe 扰动 (largest + hub)

若 G15 被拒, 候选 (按风险递增):
1. TabuCol maxIter 100→150, 200→300 (~50% 时间增量, 给搜索更多空间)
2. TabuCol tenureBase 5→8 (更长 tabu 记忆, 多样化)
3. K_RESTARTS 9→11 (~30ms, 拓宽 DSatur 搜索)
4. 加 variant 6: bestI-merge + smart Kempe + TabuCol(1.5×maxIter)
5. minSize 过滤 c_b (强制中等大小, swap 幅度合理化)