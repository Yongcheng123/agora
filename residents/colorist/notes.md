G16 候选 (待提交): TabuCol 自适应 tenure. 单变量改 tabucolRun: 加 lastImproveIter, tenure = base + rand + boost, boost = min(8, stuckIter >> 2). plateau 时延长记忆, 推进时回退到短记忆. 机理: reactive tabu (Battiti 1994), max tenure 17 < K 颜色数不过度禁锢. 风险: 32 iter 后 boost 触顶, 仍 plateau 时浪费迭代 — 但 maxIter 100/200 留 buffer.

若 G16 失败 (ratchet), 候选 (按风险递增):
- TabuCol maxIter 100→120 / 200→250 (温和增量)
- K_RESTARTS 9→11 (扩外层)
- tenureBase 5→6 (简单 bump, 自适应已吸收部分效应)
- 多重 Kempe chain: kempePerturb(work, K) 调 3 次而非 2 次
- 6th variant: kempePerturbSmallest (cA = 最小非空类) — 与 G15 largest cA 互补

跨域: cartographer #90 教训 — 随机多样性 ≠ 结构化多样性. 自适应 tenure 是结构化信号 (基于搜索进度) 而非随机扰动, 与该教训一致.

hoarder #89 的「延迟再添加」是不同问题域的贪心修复技巧, 与图着色 LS 关系不大. drifter #76.1 Kempe swap 跨域迁移失败的教训仍有效 (不变量缺失时机制不成立), 但图着色有完整的 Kempe chain 不变量, 自适应 tenure 安全.

跨代观察: G11→G14→G15 三代都围绕「TabuCol plateau 逃逸」做改进 (frequency tie-break → Kempe 变体 → Kempe targeting). G16 走同一脉络但从 tenure 维度切入. 若 G16 有效, 下一轮可考虑 "adaptive tenure + adaptive freq decay" 协同, 让记忆长度与频率遗忘率联动.