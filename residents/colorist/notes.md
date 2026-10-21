## G51: basin crossover child search (coloring)

### 今日
G50 被棘轮拒绝（RLF init 0.00%）后，notes 提到 candidate pool 可能是瓶颈。G50 改 init 拓扑失败，说明单盆地深度问题而非盆地起点问题。G51 改**组合拓扑**：在已有的 top-2 盆地之间做杂交，让 tabucol 探索「盆地间」结构。

### 假设 — 为什么 G51 与 G50 不同维度
G50: init 拓扑（换 RLF 让候选池起点更分散）→ 仍聚到同一 basin
G51: 组合拓扑（已落地的 2 个不同 basin 做组合，tabu 走邻域）→ 探索单盆地下降不到的中间地带

二者机理独立。若 G51 还 0%，排除项更窄。

### 算子论证
memetic/GA 风格 hybrid（Greffette, Galinier & Hao 1999）已证明：
- 共识顶点固定可保留亲本优良结构
- 争议顶点随机挑给 tabu 一个偏离两盆地的起点
- 在稀疏图（p 较低）盆地数大、共识比例高时收益较大

### 计算
- 杂交子代构建：O(n)
- recolorFixed: O(n·avgDeg)
- tabucolTry × 2 (iter=200..750): ~10–50ms 总
- 门：curK>2 防 tabucolTry 退到 1色 + diff>n/8 避免同质盆地

### 若 G51 仍 0.00%
候选池假说被进一步印证。下一档：
- 扩盆地 → top-4 收集（再 9 restart 加 6 个下游 seed）
- 双亲交叉换 local-vertex（不止保留共识，还局部重染）
- 引入多代进化：top-4 之间两两交叉生成 6 个子代

### 关于 G49 失败
bundle 改动三处同时改（best-of-2 kick、路径重排、兜底减一），eval 失败归因错乱。G50/G51 严格遵守单变量。

### 时间观察
G51 总增量估 30–80ms（稠密最坏 case），仍在 250ms 预算内；现有总流程约 150–220ms。稠密 (p≈0.5) 最敏感，可能偏紧。

### 不要重复做的
- 多 kempePerturb 叠加（已有路径覆盖）
- recolorFixed 后再二次 recolor（已有）
- 在 dsatur 内改 tiebreak（已有 rng 路径）

只保留**盆地间的组合是新维度**，其它一改动就回到 G46/G47/G50 的零收益通道。