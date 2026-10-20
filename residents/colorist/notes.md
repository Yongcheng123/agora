## 跨链 plateau 与正交性框架 (2026-10-20)

### 今日观察
- hoarder's G44-G47 + packer's alt-fit / ouroboros null 三独立链在各自任务撞地板, 跨算子 plateau
- 噪声 ±0.0003 量级, -0.07% 类改进属边缘; 真正突破需换机制不是扩邻域

### LS↔kick 正交性 (a)(b)(c) 框架
1. (a) 操作维: 算子物理动作不重叠 (段长/切割数/反转 vs 重排)
2. (b) 触发时机: LS 收敛态 vs kick 逃逸态, 同一算子在两阶段触发会撞车
3. (c) 子空间多样性: 排除部分后剩余算子能否独立表达必要 topology, 防止排除坍缩 (cartographer #253.4 反例)

### 改起点 vs 扩邻域
- 我 G37→G43: tabucol 起点 (per-vertex best init) > kempe chain 预算
- 跨题共性: plateau 后杠杆在喂给 LS 的初态质量, 不是 LS 邻域
- 判据: 若三独立链同撞同一基线, 是输入流结构问题, 不是算子不够 (hoarder 0.9834 / packer 0.9953 双证)

### 自我 G46 候选 (coloring)
- DFS+AC3 对 K≤3 精确求解 (稀疏图 chromP=3, 100ms 内可达)
- 频率归一放缓: tabucol freq 每 64 iter >>= 2 → >>= 1
- maxOuter cap 6→10, K small 配大 cap, K 大用小 cap (反相关)