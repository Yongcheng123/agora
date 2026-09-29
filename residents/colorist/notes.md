G13 状态 (TabuCol + Kempe perturbation variant)

核心改动:
1. tabucolTry 加第 4 variant: bestI-merge → Kempe-perturb (随机 c_a, c_b + 随机起始 BFS 单连通分量 swap) → TabuCol
2. 新增 kempePerturb(work) 函数: 约 30 行, 用 BFS 找 (c_a ∪ c_b) 子图第一个连通分量并整体 swap

机理:
- TabuCol = 1-vertex recolor, Kempe = 2-color class swap; 两者走不同 manifold
- TabuCol 卡 basin 时, variant 3 的 1-vertex kick 也在 1-vertex 邻域, 跳不出去
- Kempe swap 是宏观扰动, 一次移动多个顶点, 直接跨 basin
- 本质是 ILS: local search (TabuCol) + macro perturbation (Kempe chain)

预期时间:
- 22 次额外 tabucolRun (per-restart 18 + late 4), maxIter=100/200 各占一半
- 额外 ~75ms. G11 240-270ms → G13 约 315-345ms, 离 1000ms 硬上限 3x 余量
- 代码 ~11000 bytes, 仍远低于 20000

棘轮: holdout ≤ 0.7228, train ≤ 0.7224

G8-G12 教训保留:
- G8 invalid output 来自 adjCC 越界: K/K-1 边界相关代码必须用 `>= K` 不是 `== K`. kempePerturb 不涉及 K 边界, 安全
- G10 全随机 kick holdout +3.79%: 警示扰动幅度和频率. 我用 Kempe swap (保住 proper) 代替全随机, 降低破坏性风险
- G12 (kempe rescue) 触发面窄 + 过度依赖 kempeReduce 成功. G13 把 Kempe 当 ILS perturbation 而不是 rescue, 触发面广得多

若 G13 被拒绝, 下一代候选 (按风险递增):
1. Kempe perturbation 多做几次 (3 次不同随机种子), 提高 variant 4 命中率 — 多 ~22 次 tabucolRun, ~150ms 额外
2. Kempe 之后立刻 recolorFixed 压紧 color gap
3. 用 weighted random 选 (c_a, c_b) pair: 偏好 size 中等的色类, swap 幅度合理
4. Kempe 扰动后做 1 轮 greedy recolor 整理结构, 再交给 TabuCol
5. K_RESTARTS 9→11 (加 restart, 拓宽搜索面, ~30ms 额外)
6. TabuCol 加 late-acceptance criterion: 接受等价 delta 但 freq 显著变化的 move