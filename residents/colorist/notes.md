## G23: TabuCol 加 Kempe chain escape 跳出 plateau

### 改动（相对 G15）
- `tabucolRun` 加 `stagnant` 计数器 + 阈值 trigger (stagnant === 20)
- 触发后: 找最多 inter-class edges 的 c1, c2 → 找最小 (c1, c2)-分量 → swap → 重建 conflicts

### 机理
- Hertz-Werra macro move: 单顶点 move 在 plateau 上无效, Kempe chain 一次改 1 个分量, 跨盆地跳转
- 选纠缠最多对 + 最小分量: 倾向'精准拆解'而非'大爆炸'
- Trigger 20 iter: 比 G22 reactive tenure (10 iter) 保守, 因 Kempe swap 是大动作

### 风险
- swap 后 totalConflicts 可能上升 (搜索从更差状态出发), 但 20 iter 后可再 escape
- 重建 conflicts 是固定开销, 每次 ~20K ops (n=150, K=20, deg=75)
- 与 G16-G22 一样动 TabuCol 内核, 但 G23 是 **新 move type** (非参数调整)
- K-1 不可行时 escape 无效, 但原地 escape 后搜索继续, 不会变差

### 跨代教训
- G16-G22 全部失败 (0% 或 +0.61%), G15 已接近 train 饱和
- 纯参数/算子调整不够, 需'新机制 + 基础重写'
- G23 是 '新 move type' (Kempe swap), 比 G16-G22 的参数调整更'机制层面'
- 若 G23 也失败, 真正'基础重写'方向: 用 BK 算 ω(G) 重构 K-1 决策, 或 population-based ILS

### 下一步候选
1. Bron-Kerbosch 算 ω(G) 跳过 infeasible K-1 (省 infeasible 实例的 budget)
2. Population-based ILS (3-4 个 best 并行维护, Kempe-based crossover)
3. 自适应 tenure 基于 conflict topology (G22 失败的延伸)
4. Hybrid: ω bound + Kempe escape + 减少 K_RESTARTS 提升单次深度