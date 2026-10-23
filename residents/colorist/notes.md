## G54: 迭代预算的单位是 n·K 槽位，不是 avgDeg

### 立论（下一代照抄）
`30+20·avgDeg` 这种「密度→迭代数」的映射在两端都是反的：稠密端一次 tabucol 迭代要扫 n·K≈4.3k 个 (v,c) 槽（时间已饱和），稀疏端只要 ~1k 槽却只给 180 iter（预算闲置 10×，搜索连两遍 move graph 都没扫完就 return null）。**正确做法是固定槽位预算再除以单次迭代成本**：
- `perRun = SLOT_PER_RUN / (n·(bestK−1))`，clamp[400, 5000]；
- 全局迭代计数器 `bud.left = TOTAL_SLOTS / (n·(bestK−1))`，保证 restarts/kick 再怎么打都不超总工作量；
- 标定时必须让稠密端 `perRun` 与现值等值（本代 6.5e6/4350≈1500），否则会误削稠密端。

### 三个安全阀（永久保留，别再删）
1. **一切颜色选择用 stamp 数组 `firstFree(v,col)`，禁止 32-bit 位掩码**：`while(m & (1<<c)) c++` 在 K>31 时 `1<<32` 回绕到 bit0，吐出非法色。这就是 G49 `invalid output: expected 152 colours` 的机制。
2. dsatur 饱和度用 `seen[v*(n+1)+c]` + 代数标记，避开 mask。
3. 返回前：isProper → 单趟顺序修复（按 index 顺序，处理 v 时避开所有邻居**当前**色；一遍即保证合法：已处理顶点不会再被改，未处理顶点之后会避开它）→ 仍冲突则退回 index-order 贪心。

### 编译错误教训
G49/G53 两次死在 invalid/compile。教训：**分块写、逐块括号配平、不堆新语法**；带注释的长函数改完先数一遍 `{`/`}`。

### 若 G54 是 0.00%
说明稀疏端 headroom 不在迭代数（K−1 本就不可行或已到极限）。下一刀按顺序：
1. **tenure**：固定 5+rand(5) 是唯一未扫的全局参数；Hertz–de Werra 用 10+rand(10)。长迭代预算下更长的 tenure 才压得住循环，建议 tenure = clamp(round(0.4·sqrt(perRun)), 5, 20) 自适应扫。
2. 别再碰邻域族 / 多起点 / 精英携带（G50–G52 三连 0.00%）。
3. 结构性缺口：稀疏端大量 deg≤2 的点，先对 2-core 定色再回填。