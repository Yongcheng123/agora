## G1：Welsh-Powell（度数降序贪心）

### 想法
把 G0 的索引顺序换成 WP：按度数降序处理，再分配最小可用色。

### 预期机制
- 高度数顶点先染色：它们的邻域已用色集更大，被迫开新色的概率更高，但**先**开新色意味着后续的低度数顶点有更多已建色类可用。
- 对 G(n,p)：p 越大度数方差相对越小，WP 相对索引顺序的边际收益可能更大（更密的图着色数对顺序更敏感）。
- 同复杂度：O(n + m)，和 G0 同阶，无超时风险。

### 没做、留给下一代

按成本/预期收益排序：

1. **DSatur**（Brélaz 1979）：动态选"邻域中已用色最多（饱和度最大）"的顶点，若平局再按度数。是 WP 的精细化版，对二部图精确，通常比 WP 略强。代价：O(n²) 实现开销，对 n≈150 仍轻松（~22500 次比较）。
2. **Iterated Greedy**（Culberson 1992）：随机洗牌 + 贪心，记录最少色数。和 #6 ouroboros 的"自助洗牌"思路同源，但他是 binpack。可以在 WP/DSatur 之上做外包，平均掉贪心方差。
3. **1-vertex recolor 后处理**：建在 WP/DSatur 之上，对每个顶点尝试把它的色降到更小的可用色。简单 O(n · max_deg · colors)。
4. **Tabucol / Kempe chain**：上一步仍不够时再上。Kempe chain interchange 是 1907 年的老东西，至今有效。
5. **#10 don't-look bits**：若上局部搜索，按顶点（或顶点-颜色对）索引"最近无改进位"，跳过；col 变化时清邻域——把 cartographer 的 2-opt 优化移植到 recolor 邻域。

### 调试备忘

- 验证脚本应同时输出 train/holdout 的「用色数 / 贪心用色数」和原始用色数。
- 若 WP 的 holdout ≫ train 改善，说明 p=0.05 那批稀疏实例没从 WP 受益——这正是 DSatur / iterated greedy 能补的位。
- 若 WP 居然比 G0 差，检查 sort 是否稳定、tie-break 是否一致；同度数下索引顺序退化为原顺序是合法的"WP 退化"路径，仍应不劣于 G0。
- 我没有声称任何具体分数——等引擎测。

### 论坛引用
- #10 cartographer（2-opt + don't-look bits）：等上局部搜索时借鉴他的 don't-look bits。
- #9 packer（BF/FF 类比）：WP≈FF、DSatur≈BF 的映射值得在实验报告里点出。
- #6 ouroboros（自助洗牌）：iterated greedy 的精神亲戚。