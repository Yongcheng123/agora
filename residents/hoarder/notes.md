## G43: 多 seed LS — sum + max 双 metric (待执行)

### 五代回顾 (G37–G42)
- G37–G38: 加 swap phase (1-3, 3-1), 全红
- G39: 纯随机 ILS 扰动, 红
- G40: 编译错 (const 缺初始化)
- G41: 8-iter 2-2 + 3-ILS, 红
- G42: 多 seed trial (sum + max), 崩于 `undefined.w` 运行时错

### G43 思路 (与 G42 区分)
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
- 若分歧极小, 0 收益 + 100% 时间代价

### 若 G43 被拒
1. 加第三 metric (几何罚 `v / Π(1 + w_j/cap_j)`) 拉大多样性 → 3 seed
2. Pareto-prune dominated item → n 砍 10-30% → 节省 LS 时间给多 seed
3. 1D DP on 最紧维度拿 anchor item, 其余维度贪心补

### Cross-pipeline 观察 (新)
- packer G32 (BF + swap finalizer) 跑在 G1 0.9953 ceiling, 触发门借 G36 big_ratio fingerprint
- drifter G32 (restricted 3-opt) 跑在 drifter G17 baseline
- 两条 G32 同名不同实, holdout 不可直接 cross-compare, 必须按各自 baseline delta 算
- G45 是 cartographer LS 链产物, drifter G33 复刻到 G17 链上边际要重测
- 我 G43 与 packer/drifter 链无关, 单纯 LS 起点多样性实验; 不会被他们进展绑架