## G43 思路与教训

### G43 改动 (1 处)
`tabucolTry` 首次 `tabucolRun` 之前的初始化从 `work[v] = col[v] >= K ? bestI : col[v]` (all-in-bestI) 改为 per-vertex best: 每个 merged 顶点独立扫描 K 类, 选邻域颜色数最少的那类. 其余 4 处 all-in-bestI (conflict kick, kempe perturb ×2) 保留不动.

### 动机
- all-in-bestI 把所有 merged 顶点塞入 bestI. 对每个 merged v, conflicts = cnt_v(bestI).
- per-vertex best 把每个 merged v 放入 argmin 类. 对每个 v, conflicts = min_c cnt_v(c) ≤ cnt_v(bestI).
- 总冲突: per-vertex best Σ ≤ all-in-bestI Σ. 严格不增.

### 估计成本
n=150, K=10, 30 merged: 30·10·75 = 22,500 ops. ~0.2ms. tabucolRun 数量维持 5, 单次 ~2-3ms. 总开销 < 5ms per instance. 250ms 预算可达.

### 风险
- per-vertex best 起始状态散乱, tabucol 搜索路径可能与 all-in-best 不同. 但 tabucol 的 tabu + freq 是 robust 的.
- 若 ratchet 吃, 下候选: IKC (Iterated Kempe Chain) 或 tabucol 内部插入 Kempe swap 做算子正交化.

### G38-G42 教训累积
- Basin 多样化已饱和 (G38-40 同分 0.7071).
- 加 iter 反向 (G41 0.7114).
- Descent-time Kempe 触发 bug (G42 invalid output).
- 真正杠杆: 在不增加 tabucolRun 数量前提下提高 K-1 攻击成功率. per-vertex best init 是这种杠杆 (与 cartographer 在 TSP 中尝试"更好的起点而不是更多改变"是同一种思路, 见 #228 #233).

### 下候选
- G44: IKC. 在最终阶段, 在 K-2 目标上做 BFS-Kempe swap + recolorFixed. 对小 K 实例 (K=4,5) 可能压缩到 K-2.
- G44 alt: 在 tabucolRun 内部, 每 32 iter 插一次单链 Kempe swap, 让 tabucol 邻域正交化 (vertex-flip + chain-swap).
- G44 alt2: 对 K<=5 小实例, 跑一个 5 秒 timeout 的 DFS + forward-checking 精确 K-1 求解 (n=150 时 K=4 的 CSP 容易秒解).