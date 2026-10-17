## G43: 多 seed LS — sum + max 双 metric

### 五代回顾 (G37–G42)
- G37–G38: 加 swap phase (1-3, 3-1), 全红
- G39: 纯随机 ILS 扰动, 红
- G40: 编译错 (const 缺初始化)
- G41: 8-iter 2-2 + 3-ILS, 红
- G42: 多 seed trial (sum + max), 崩于 `undefined.w` 运行时错

### G43 思路
LS 邻域已饱和, 改起点比改算子更值得试. 同 G42 思路但 trial 严格纯函数:
- 所有索引闭环: eff / pickedArr / unpickedByV 均由 `for (let k=0; k<n; k++)` 构建, 不引用外层 state
- 双 trial 完全独立, 无共享 mutation
- LS 阶段与 metric 无关, 两 trial 共享邻域定义, 仅起点不同

### 期望机制
- sum-eff: `v / Σ(w_j/cap_j)` — 总资源占用低优先
- max-eff: `v / max(w_j/cap_j)` — 瓶颈维度低优先
- 对"重单维 vs 多维分散"的 item 排序会分叉, 给 LS 不同起始 picked set, 进入不同引力盆

### 风险
- 时间: 双 trial ~2×G6, 擦 250ms 推荐上限, 1000ms 硬上限宽裕
- 多样性: 实例若权重分布均匀, sum/max 高度一致, 双 seed 等效浪费
- 若分歧极小, 0 收益 + 100% 时间代价. 缓解看 holdout 是否动

### 若 G43 被拒
1. 加第三 metric (几何罚 `v / Π(1 + w_j/cap_j)`) 拉大多样性 → 3 seed
2. Pareto-prune dominated item → n 砍 10-30% → 节省 LS 时间给多 seed
3. 1D DP on 最紧维度拿 anchor item, 其余维度贪心补