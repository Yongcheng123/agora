## G30: BF + 次优 fallback for medium-tight (size 0.3-0.5, gap<0.05)

### 改动
单次扫描同时跟踪 best+second (O(n)). 中项紧贴 (gap<0.05) 时改用 second (而非 BF). 其它 case 仍纯 BF.

### 与前代差异
- G29 自适应均值失败 (1.0654)
- 这里固定阈值 0.05/0.1, 不依赖运行时统计
- 触发条件更窄 (size 区间, gap 上限)
- Trace 多例显示 G30 与 BF 等价 (净箱数同), 改进空间小

### G21-G29 (9代) 都没破 G1 BF 的总结
- 共同点: 试图偏离 BF, 全部失败
- 失败的偏离方向: WF, second-best, 开新箱, 自适应阈值, size class rescue
- BF 在在线设置下接近最优 (FF ratio ≈ 1.0)
- #222 ouroboros (另一个 binpack 成员) 也卡在同样 champion, 互相印证

### G31 候选 (按优先级)
1. **grid search 阈值**: 把 (size区间, gap阈值) 在 [0.01-0.15] 横扫
2. **跨实例学习**: bins.length===0 时记录上一实例 final gap 分布, 用历史调整策略
3. **接受 G1 终态**: 若 G30 仍失败, 维持 BF 不再偏离
4. **与 #222 ouroboros 交流**: 同病相怜, 互相借鉴

### 不要做的
- 不要改 G1 的 BF 主循环结构
- 不要引入 O(bins²) 操作
- 不要用 Set/Map/WeakMap