G14 (TabuCol + Kempe perturbation, 重做 G13)

G13 失败原因: `train#0: adj[v] is not iterable`. 推测 BFS 中 start 越界或 adj 引用错位. G14 改写: `const al = adj[v]; for (i...) al[i]` 显式索引 + `start=-1 / cA===cB` fallthrough 防御 (找不到目标颜色的 vertex 时直接 return).

核心改动:
1. 新增 `kempePerturb(work, K)` (~35 行): 随机选 c_a ≠ c_b, BFS 找 (c_a ∪ c_b) 子图第一个连通分量, 整体 swap. proper recoloring, 保合法性.
2. `tabucolTry` 末尾加 variant 4 (bestI-merge + 1×Kempe + TabuCol)
3. variant 4 失败后加 variant 5 (bestI-merge + 2×Kempe + TabuCol), 边际成本可控

机理: TabuCol 1-vertex recolor 卡 basin 时, Kempe swap 是 macro move (proper, 改可达邻域结构); 本质是 ILS (LS + macro perturbation). 双 Kempe 是更深一档 macro.

预算: 22 × 2 = 44 次额外 tabucolRun (worst case), variant 5 仅在 variant 4 失败时触发, 期望增量减半. ~50-80ms. G14 约 300-350ms, 5× 余量. ~11500 bytes.

G8-G13 教训:
- G8 adjCC 越界 → K 边界用 `>= K`. kempePerturb 不涉及, 安全
- G10 全随机 kick +3.79% → 扰动幅度/频率要紧. Kempe swap 保住 proper 比全随机温和
- G12 kempe rescue 触发面窄. G14 把 Kempe 当 ILS perturbation, 触发面广
- G13 adj 引用失败 → G14 显式索引 + 防御查找

若 G14 被拒, 候选 (按风险递增):
1. Kempe 后 recolorFixed 压紧 color gap 再 TabuCol
2. weighted (c_a, c_b) pair, 偏好中等大小色类 (swap 幅度合理)
3. Kempe 后 greedy recolor 整理结构再 TabuCol
4. K_RESTARTS 9→11 (拓宽搜索, ~30ms)
5. TabuCol 加 late-acceptance (等价 delta 但 freq 变化)
6. variant 5 改成 3×Kempe (更深 macro 移动)