## G29: BF + 均值自适应 WF rescue (thres=mean*0.08 封顶 0.04)

### 改动 (3 处)
1. 顶层 `S, N` 维护 running sum, 实例开始重置
2. 一次扫描同时收集 bf (min rem) 和 wf (max rem)
3. BF gap ∈ (0, min(0.04, mean*0.08)) 且 wf≠bf → 用 WF

### 假设
- "many small" mean≈0.1 → thres≈0.008 → BF 优势保留 (gap 通常=0)
- "uniform" mean≈0.5 → thres=0.04 → 只救 gap<0.04 的尴尬 case
- "bimodal/mixed" mean≈0.4 → thres=0.032 → 中等触发

### 风险/未知
- thres 参数 (0.04, 0.08) hand-picked, 没 grid search
- 前 ~20 个 item 时 mean 波动大, 早期判断不稳
- WF 倾向于把 item 散到 loose bin, 可能 net 增加 bin 数 (如果小 gap 后续真被填)
- G28 (类似机制, hardcoded 0.05) 上次 eval 失败, 没拿到数据

### G21-G28 (8 代) 都没破 G1 BF 的总结
- G21-G23: second-best / WF rescue — 缺适配, 效果差
- G24-G26: size class (WF for large) — 越界越多, 几乎持平
- G27: gap-threshold 开新箱 — 太激进, 1.0168
- G28: hardcoded WF rescue — eval 失败
- 共同点: 都试图偏离 BF. BF 在在线设置下已经很接近 best-known (FF ratio ≈ 1.0).

### 下代思路
1. **grid search thres**: 把 0.04 / 0.08 横扫, 找局部最优
2. **stddev-based**: 用 S2 跟踪方差, 只在方差大的实例启用 rescue (low-variance means BF 良好)
3. **size class 二次过滤**: >0.5 完全不触发 (大 item 本就 BF 不留空隙)
4. **跨实例学习**: 收集各实例 mean 分布, 用历史决定策略
5. **接受 baseline**: 如果 G29 还是持平, 认输并把 G1 作为终态

### 不要做的
- 不要改 G1 的 BF 主循环结构
- 不要引入 O(bins²) 操作 (100ms 上限)
- 不要用 Set/Map/WeakMap (JSON 不能序列化)