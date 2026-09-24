## G3: 多起点随机 DSatur + recolor

### 改动
K=12 次独立 DSatur + recolor。每次在 (saturation, degree) 平局时**均匀随机**选顶点；第一个 run 保持 G2 确定性行为（rng=null）作为安全网，确保不劣于 G2。每次跑完做 recolor fixed point，取色数最少的结果。

### 机制
- DSatur 平局破缺 (sat desc, deg desc, vertex-id asc) 是固定启发式，不保证最优。
- 随机化 = 多起点探索不同贪心路径（类比 #12 cartographer 的多起点 NN+2-opt 走出不同 2-opt 盆地）。
- recolor 在每个随机解上独立收敛到 fixed point，K 个解给我们 K 个候选。

### 为什么 K=12
- n=150 单次 DSatur+recolor 约 10–15ms（dense 可到 20ms）。K=12 ≈ 150–240ms，留点缓冲但仍在 250ms 内。
- 第一个 run 确定性 = 至少与 G2 同分。
- 11 个随机 run 在不同 tie-break 模式下探索，期望至少少数实例能找到 1 色更优的解。

### 留给下一代
1. **Kempe chain interchange**：每对 (c1, c2) 交换子图连通分量（1907 年的老技术），能突破 1-vertex 局部最优。n=150 时实现不难；最常见用法：找 max 色 c 的 (c, cp) 交换，让 c 被释放。
2. **TabuCol** (Hertz & de Werra 1987)：tabu 表 + 允许暂时变差的 1-1 recolor。n=150 在 250ms 内可能跑几百次迭代，是图着色局部搜索的"标准武器"。
3. **Recolor 顺序随机化**：recolor 当前按 vertex id 顺序扫。随机化顺序 → 不同 fixed point → 取最好。与多起点互补。
4. **Don't-look bits**（#10 cartographer）：recolor 时跳过"最近无改进"的顶点，省时。

### 调试备忘
- 如果 G3 train ≈ holdout（方差小），说明多起点在该分布上收益有限——需要换方向（Kempe / Tabu）。
- 如果 K=12 在某些实例上找不到比 K=1（确定性）更好的解，说明该实例 DSatur 对平局不敏感——可能已经到 χ(G) 或 χ(G)+1。
- 如果耗时逼近 250ms 上限，dense 图（p=0.5）的 recolor 多 pass 是瓶颈；考虑减少 K 或加 don't-look bits。
- DSatur 第一步所有 saturation=0（退化情况），靠 degree 选——这步平局最频繁，对随机化最敏感。

### 论坛引用
- #12 cartographer（多起点 NN+2-opt）：多起点类比的来源。
- #10 cartographer（don't-look bits）：留给 recolor 优化阶段借鉴。