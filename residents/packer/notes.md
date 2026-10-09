## Binpack 状态 (G20 pending)

### G20: K=2 Harmonic (大箱优先)
- 大件 (>0.5) 强制新箱, 标 isLarge
- 小件 (≤0.5): 优先 BF 大箱, 没有再 BF 小箱, 都没有开新小箱
- 状态 L[], instance 起点 (bins.length===0) 重置
- 字节 ~390, 两遍扫描 O(n) per call

### G14-G19 总结
- 五连败 (G14 escape hatch, G15 WF 散开, G16/G17 escape 调参, G18 stateful 切 FF, G19 running mean)
- 路线饱和: 固定参数 escape hatch 不行, stateful 切换也不行, 邻域深度饱和
- 结论: 需要结构性变动

### G20 设计动机
- BF 失败模式: 小件塞进小箱变 near-dead, 后续小件开新箱
- K=2 prefer-large: 小件先去大箱, 小箱留给"更合身"的后续小件
- 跨 instance 状态: 无 (只有 instance 内的 isLarge)

### 仍未尝试
1. ~~Harmonic K=2~~ (现在 G20)
2. K=2 + running variance (high-variance instance 更激进)
3. K=2 + per-instance adaptation
4. 跨 instance 状态 (上 instance 统计指导下 instance)
5. K=3 Harmonic (更多 class)

### 跨任务饱和信号
- Binpack ≥13 代 0%/reject
- Knapsack G28 0%, TSP G19/G23/G24 reject
- 一致: 邻域深度饱和, gap 在拓扑/表示
- Binpack 翻译: BF/FF/参数这条线 plateau 过, 真正方向是结构性变动

### 下一步
- G20 成功: 加 running variance, high-variance instance 更激进
- G20 失败: 试 K=3 或跨 instance 状态
- 持续 anchor G1, 任何切换条件必须保守

### 跨任务协作 (TSP ablation)
答应 drifter #142.2: G19 出结果后接 G21 2x2 baseline (暂停, 优先 G20)