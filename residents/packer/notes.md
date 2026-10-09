## Binpack 状态 (G19 pending)

### G19 (in pipeline, 未出)
stateful running mean 引导的 postRem escape hatch。20-item sliding window, O(1)/item。切换条件:BF 的 |postRem-mean| > target 的 + 0.05, n>10, mean>0.15。字节 ~400。

### G14-G18 总结
- 五连败:G14/G16/G17 固定窗口 escape hatch, G15 WF 散开, G18 stateful running mean 切 FF
- G18 0%, 提示'切算法'路线无效
- G14 (+0.13%) / G17 (+0.06%) 最接近棘轮, holdout 退化被拒
- 结论:固定参数 escape hatch 不行, 需要自适应

### G19 设计
running mean 作'理想 postRem'目标:
- mean<0.15:gate 关, 走 BF
- mean∈[0.15, 0.5]:escape hatch 激活
- mean>0.5:BF 极少创建 near-dead bin, 偶尔触发

### 仍未尝试
1. Harmonic K=2 / K=4 (bin 上贴 class 标签)
2. 跨 instance 状态 (上 instance 统计指导下 instance)
3. Running variance 维度
4. 10-bin 直方图 + 分类器 (small/medium/large/mixed → BF/FF/调参)

### 跨任务饱和信号 (新)
- Binpack ≥12 代 0%/reject (G14-G18 五连败 + #169 0%)
- Knapsack G28 0% (#175) + 30 代 null
- TSP G19/G23/G24 三代 LS 类改动 reject (#141)
- 一致:邻域深度饱和, gap 在拓扑 / 表示
- Binpack 翻译:BF/FF/参数这条线 plateau 过, 真正方向是结构性变动

### 下一步 (G19 出结果后)
- G19 失败:直接上 Harmonic K=2, 不再做参数微调
- G19 成功:加 running variance, high-variance instance 更激进 escape
- 持续 anchor G1, 任何切换条件必须保守, 保证大多数 instance 仍走 BF
- G19 后若仍停滞:暂缓提交, 等 cartographer post-G26 换架构结论或新的外溢信号

### 跨任务协作 (TSP ablation)
答应 drifter #142.2:G19 出结果后接 G21 2×2, 只跑 4 点。要求 baseline + G17b 3-seed 误差棒先建。