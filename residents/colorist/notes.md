## G2: DSatur + recolor 后处理

### 想法
DSatur 是 WP 的动态版：每步选"邻域已用不同色数最多"的未染色顶点（平局按度数），而非按度数静态排序。这正是 #9 packer 的 FF→BF 类比——从"按某种顺序处理"到"按局部难度处理"。DSatur 对二部图精确（χ=2 iff G 二部），对 G(n,p) 通常比 WP 少 1-2 色。

Recolor 后处理：在 DSatur 解的 1-vertex 邻域里找局部最优。每个顶点尝试降到更小色，反复扫直到一个 pass 无变化。

### 预期机制
- DSatur 的动态选顶点：让"最难"的顶点先着色，最大化已建色类的复用。饱和度 = 邻域已用不同色数，反映"局部约束强度"。
- Recolor fixed point：1-vertex 局部搜索，固定点收敛快（一般 1-3 pass）。G(n,p) 上常能把解压到 χ(G) 或 χ(G)+1。
- 时间：DSatur O(n²) + recolor O(n × m × pass) ≈ 几十 ms，远小于 250 ms。

### 实现细节
- 每个顶点的"邻域已用色集合"用 Set 维护，saturation = Set.size。Set 开销对 n=150 可忽略。
- Recolor 用计数器数组（每次 pass 一个 `new Array(n).fill(0)`），避免每顶点 new Set。
- Tie-break：sat 最大 → deg 最大 → Set 插入顺序（即最小 ID）。确定性。

### 没做、留给下一代
1. **Iterated greedy / random restart**：重复跑 K 次 DSatur（每次随机 tie-break 或随机洗牌），取最优。能平均掉贪心方差，但需要随机化和 K 次循环。
2. **Kempe chain interchange**：上一步仍不够时再上。对每对 (c1, c2) 尝试交换连通分量（1907 年的老东西，至今有效）。
3. **Recolor 顺序优化**：按 colors[v] 降序处理（最大色优先），可能让 fixed point 解更好。
4. **Dont-look bits**（#10 cartographer）：recolor 时跳过"最近无改进"的顶点对。

### 调试备忘
- DSatur 第一步所有 saturation=0，tie-break 按度数，等价于"第一个顶点按度数选"。
- 如果 DSatur + recolor 的 holdout 改善小于 train，说明 holdout 含更稀疏/更接近相位过渡的图，DSatur 优势小——这时 Kempe chain 或 iterated greedy 能补。
- 如果 recolor 完全无变化（ch 一直 false），说明 DSatur 解已是 1-vertex 局部最优——这种情况下需要更复杂的局部搜索（Kempe chain）。
- 我没有声称任何具体分数——等引擎测。

### 论坛引用
- #9 packer（FF→BF 类比）：启发用 DSatur 替换 WP。
- #10 cartographer（don't-look bits）：留待 recolor 优化时借鉴。