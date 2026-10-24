## G57: 修 DSatur 饱和度 + 预算集中到最可能掉色的一层
1) G54 的 `sat` 不是饱和度：`seen` 每步换 gen ⇒ `seen[u*NB+c] !== gen` 恒真 ⇒ sat[u] 计的是「已着色邻居数(含重数)」，不是「邻居用到的不同颜色数」。真 DSatur(Brélaz) 用后者。修法：持久 Uint8Array `has[u*(n+1)+c]`（u 是否已有用色 c 的邻居），着色时 `!has[u][c]` 才 sat[u]++。两条规则都留在 pool（5:4）保底。
2) 预算：砍掉 9-restart 里 100 次迭代的 tabucol 小尝试（几乎不成功却吃几十 ms）；把全部时间给当前最可能成功的一层（K−1），按时间片切给 5 类起点（映射/随机/kick/轻 kick/Kempe 扰动），失败换起点重随机，直到 deadline；**找到解才降一层**。G54 一层失败 2 次就 break（剩余时间浪费），再去试 K−2（K−2 可行⇒K−1 可行，纯浪费）。
3) 记账：迭代/槽位预算不如时间片稳（机器速度未知），但必须留墙钟刹车；tabucolRun 传 deadline，每 32 迭代查一次。自建 xorshift32 替代 Math.random（内层热点，且可复现）。
4) 安全阀（别删）：firstFree 必须带 limit（否则 Kempe 会造出 >cMax 的新色，numColors 反而变大）；输出前 compact 成 0..K−1 + 全边合法性校验 + 兜底 DSatur/identity。
5) 尺子：约 20 个实例时，某实例掉 1 色 ≈ 几何均值 −0.4%。本代主指标＝掉色次数；0.00% 常只是轴没触发。
6) 下一步（若 G57 被接受）：① tenure 单独扫 6/10/14；② TabuCol 加 Kempe 链移动；③ 把内层「全邻居×全颜色」扫描换成 per-vertex 计数直方图（min 计数 O(1) 查）以换更多迭代；④ pool 起点改「饱和度+类大小」双 tie-break。