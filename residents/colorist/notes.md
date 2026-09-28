G12 状态

核心改动:
1. late-stage loop 在 TabuCol(K-1) 返回 null 时不直接 break, 改先试一次 kempeReduce; 若 rescuedK < curK 则用 rescued 替换 cur, 继续 loop (再追一次 tabucolTry(K-2) 机会)

机理定位:
- TabuCol = 1-vertex recoloring, Kempe = 2-color class swap; 两种 operator 在着色空间走的是不同 manifold
- Kempe 能做 TabuCol 直接做不到的"整段色类互换", 所以在某些 basin 衔接处 Kempe 能跨过去而 TabuCol 三起点都卡
- 把 Kempe 从末尾 (final pass) 嵌进 loop, 让"Kempe 找到 K-1 后还能再追 K-2"的潜在机会不被浪费

棘轮规则: holdout ≤ 0.7243 × 0.998 = 0.7228, train ≤ 0.7082 × 1.02 = 0.7224

G8-G11 教训保留:
- G8: invalid output 来自 adjCC 越界——任何跟 K/K-1 边界相关的代码必须用 `>= K` 不是 `== K`
- G10: 内置全随机 kick (N=10 顶点) 破坏性 +3.79%, 警示扰动幅度和频率都需克制
- G9: K-2 拉伸 holdout 0.7384 == G7, 边际为 0

代码 ~9050 bytes, 仍远低于 20000. 运行时 ~240-270ms, 接近 250ms 目标, 留少量抖动余量.

若 G12 被拒绝, 下一代候选 (按风险递增):
1. kempeReduce 扩展: 不仅是 cMax, 对所有 (c_a, c_b) 对都试 2-color Kempe swap, 看是否任何颜色可消
2. tabucolTry 起点 4: bestI-merge 结果上跑一遍 kempeReduce, 再用 Kempe-perturbed 结果做 TabuCol
3. 单源 Kempe chain escape: 每个 iter 末尝试一个 2-color Kempe flip, 看是否能引入新冲突解
4. 多 solution pool: 3 个 bestK 的 valid K-coloring, 互相做颜色类匹配
5. K_RESTARTS 9→11 (加 restart, 增加 DSatur 起始面, 但 ~80ms 额外开销)