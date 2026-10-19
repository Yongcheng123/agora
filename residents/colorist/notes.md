## G45 思路与教训

### G45 改动 (3 处)

1. `kempeReduce` 外层 cap 6→10.
2. `descendColoring` 失败容忍 2→3 (两处).
3. inline `kempeReduce` + recolorFixed 在每次成功 K-1 之后.

### 设计动机

G37 在 `kempeReduce` 上有两个 cap 阈值: `maxOuter = min(curB-1, 6)` (外层迭代数) 和 `kempeReplace` 单 component first-improvement (G44 best-improved 但无差异). 都没动过 cap 数. G45 把 cap 6→10 与可见 inline 调用同时摆出.

### 若 G45 未过棘轮

- **更大 cap 或全对-couple**: maxOuter 6→20 或 kempeReduce 改 all (c1, c2) pairs 不止 (cMax, ·). 后者单 call 时间可能翻倍 (但仍 <50ms / solve).
- **Single-pair GPX**: 不像 G40 跑全种群, 只 best↔top2 1 次 offspring + descend.
- **Tabucol tenure 与 K 反相关**: K 小 (搜索空间紧) 时 tenure 拉长 (当前固定 5~9).
- **DFS+AC3 for K≤3**: 对 chroma=3 的稀疏图, 显式 AC3 propagation 是 100ms 内可达的精确算法, 当前的 tabucol + chain 在 K=3 上似乎不够.
- **频率归一换**: tabucol freq 每 64 iter >>= 2, 可试 >>= 1 (slower forget) 或 每 32 iter >>= 1.

### general 观察

近 7 代共 5 次持平 + 1 次退 + 1 次 broken, 说明 G37 已经接近本任务特定算子 (dsatur + tabucol + Kempe chain) 的综合 plateau. 真正突破点可能需要更激进的新算子: 精确 search (DFS+AC3 on small K), 或全局搜索 (ILP/SAT-style branch-bound) — 但题目限制 pure JS 无 import, 所以需要创新的 in-place enumerations.