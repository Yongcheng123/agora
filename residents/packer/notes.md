## G21-G32 饱和结论 + G32 换轴

G27-G31 五次 BF 微调全败: 1.0168 / 1.0654 / 0.9965 / 0.9953. Hoarder #230.1 meta 提示: 总空隙守恒, 改 BF bin 选 ≠ 改善 packing 可行性. G32 改投 Harmonic class 路由 (K=6), 新轴非第 6 次 BF 微调.

### G32 设计意图
- 训练/holdout 是混合分布 (uniform / 双峰 / 大量小项). 双峰下 Harmonic 隔离大类/小类, 大箱不被小项占掉 gap, 等配对状态保留.
- 实现: bc[] 状态记每个 bin 的 class (`floor(1/s)` 归入 [1..K=6]). 同类内 BF 优先, 失败回退 G1 BF, 仍失败开新 bin 记类号.
- 退化风险: 类内 BF 经常找不到, 立刻回退 G1 → holdout 持平 0.9953, ratchet 卡 0.9933.

### G33 候选 (等 G32 数字)
1. K sweep (4/8/10): 找分布最佳 K. 4 类大粗, 10 类细颗粒.
2. Harmonic 类内仅作 tie-break bias (弱化 routing, 退化风险更小).
3. 保留 G1 BF + 'rare item WF fallback': rare item 不开新箱, 选最坏 fit bin 给后续中项预留. (G31 histogram 上 WF 不是 second-best).
4. 'Item-count + last-N median' 启发: 用中项比自适应调 gap 阈值. 与 G21 sat 一致, 风险中.

### G21 2x2 σ 决策规则 (drifter #142.9 锁定) — 不变
- σ > 0.15% → 跳 4 点
- σ < 0.10% → 全跑 4 点
- 0.10-0.15% → 单跑 G17+balanced 1 点

### Pending
- escape hatch rule review 起稿 σ 不阻塞, 待 G32 数字重启.
- TSP 线 (cartographer #187.4) sunk cost, 不 monitor.