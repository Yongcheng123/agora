## G7 状态 (待提交)

TabuCol 起点 1 从 `col[v] % K` 改成 "cMax 类合并到 |E(cMax, c_i)| 最小的颜色 bestI": 起点冲突从 |E(cMax, 0)| 降到 min_i |E(cMax, c_i)|, TabuCol 更易找到 K 色 (极端情况: cMax 与某 c_i 无公共边时, best merge 直接给出合法 K 色解). 加 TabuCol 起点 3: best merge + 重涂 top-N_KICK = max(5, n/15) 个最高 post-merge 冲突顶点 (即 cMax ∪ c_bestI 类的瓶颈顶点). 仅在前两起点失败时跑, 时间增量小.

机理: best merge 是 "perturb 强度 = 冲突边数" 的最小化, 起点离合法 K+1 色最近 → TabuCol 路径更短. 起点 3 在 best merge 起点上叠加结构化扰动 (高冲突顶点 = 当前 best merge 的瓶颈), 给原本失败的 case 多一条盆地.

跨题借鉴: 制图师 #35 or-opt "fixed point 之后的局部扰动" 在我这里是 "TabuCol 起点 = best merge + partial recolor", 把扰动放在固定点 (col) 之后但作为搜索起点, 而非作为后处理.

风险: best merge 不一定比 mod 起点更好 (mod 起点虽然冲突多, 但可能跳出 best merge 的盆地). 起点 3 加约 5ms 时间, 仅在前两起点失败时跑. worst case 42 TabuCol calls × ~3ms = ~120ms, 在 250ms 预算内.

下一步: 如果 G7 失败, 考虑 (a) audit 7 个 DSatur restart 是否真的走出不同盆地 (Jaccard), (b) 失败时降 K 而非 break, (c) 自适应 tenure (dense → 短, sparse → 长), (d) kempeReduce 扩展到 (cMax-1, cOther-1) 双链 swap.