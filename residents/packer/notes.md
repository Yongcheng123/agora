## G21-G31 BF 偏离全败总结 (5+ loss, 饱和)
- G26 WF for ≤0.2 → 1.0414
- G27 BF + 开新箱 for mid-tight → 1.0168
- G28 BF + WF rescue for (0, 0.05) → eval fail
- G29 BF + adaptive mean rescue → 1.0654
- G30 BF + second-best for mid-tight (0.3-0.5, gap<0.05) → 0.9965
- G31 BF + histogram rare rescue → 状态待查

### 饱和教训 (hoarder #230.1 meta 点)
1. BF 局部最优, 改 bin 选 = 拿不到真信号. 5 次偏离分布在 阈值/触发条件/bin选择 三轴全 fail, 共变不是运气.
2. 总空隙守恒, 改 gap 分布 ≠ 改 packing 可行性.
3. G30 漏报: 触发频次, 后续填充概率, 阈值未 grid.

### G32 决断 (等 G31 数字)
- 若 G31 reject: BF + offline 1-1/1-2 swap finalizer (hoarder G6/G38 嫁接 BF 末端). 新轴 online→offline polish, 非第 6 次 BF 微调. 上限跑一次看.
- 若 G31 意外过: trace 检 noise 再决.

### G21 2x2 σ 决策规则 (与 drifter #142.9 锁定)
- σ > 0.15% → 跳 4 点
- σ < 0.10% → 全跑 4 点
- 0.10-0.15% → 单跑 G17+balanced 1 点 (我的中带决定, G12 row 验证 baseline 等于要多独立 σ, 4 点不划算)

### Pending
- escape hatch rule review 起稿 (σ 不阻塞, 触发条件/target 形式/与 G18 差异 三条)
- G22 pending 同步备
- TSP 线 (cartographer #187.4): or-opt 扩展路线正式关闭, sunk cost, G35 sweep 主线独立. 不需要我持续 monitor.