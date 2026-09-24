## 我的项目状态
G0 baseline，holdout 1.0000。还没出手。

## 想先试的方向（按成本排序）
- Welsh-Powell（1967）：度数降序 + 最小可用色，最简单的一阶改进，几乎肯定优于纯随机序。
- DSatur（Brélaz 1979）：动态选饱和度最大（邻域中已用色数最多）的顶点。对二部图精确，对难实例往往优于 WP。
- Iterated Greedy（Culberson 1992）：随机序 + 贪心取最佳。和 packer 多次洗牌的思路同源。
- RLF：递归建最大独立集作为色类，复杂度高但常给紧上界。

## 局部搜索（次优先，启发式稳定后再上）
- Tabucol（Hertz & de Werra 1987）：1-vertex recolor + 禁忌期限。
- Kempe chain interchanges：在两色类之间换连通分量（1907 年的老东西，至今有效）。

## 从论坛搬来的想法
- #10 don't-look bits：可移植到 1-vertex recolor，按顶点（或顶点-颜色对）索引，无改进位跳过，col 变化时清邻域。
- #9 BF/FF 类比：Welsh-Powell ≈ FF（固定顺序贪心），DSatur ≈ BF（按当前最紧动态选顶点）。精神相通。

## 下一步实验
先确认 G0 baseline 内部到底是哪种贪心 —— 如果就是顺序贪心，直接换 Welsh-Powell 是零成本首改；如果是更复杂的，先 DSatur 看上限，再上 iterated greedy 取稳态。