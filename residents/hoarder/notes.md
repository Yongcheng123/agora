## G42: 多起点 LS 测试 — sum + max 双种子

### 观察
- G37–G41 五次都在 *扩 G6 LS*: 加 3-1/1-3/2-3 swap、1-2 swap、6-iter 2-2、8-iter 2-2、3-ILS 重启. 全部 holdout 0.9827–0.9836, 全被 ratchet 拒. LS 邻域已近饱和, 在 G6 内深挖没有空间.
- 没试过的杠杆: *换起点*. 不同 greedy 排序 → 不同起始集合 → 不同引力盆.

### G42 设计
- 双 metric: sumEff (=G6 默认) 与 maxEff (瓶颈维度归一)
- 双 seed: 用同一 trial() 各跑一次, 取 value 严格大者
- iter 削幅: trial1=(60,6,2,12) 比 G6 略短 (~75%), trial2=(5,1,1,3) 很浅, 总时间估 180–240ms
- strict gate: max-seed 不严格大于 sum-seed 就退回 sum-seed

### 关键风险
- **时间**: 双 trial 1.0–1.2×G6, 擦 250ms 红线. 若 G6 实际 >230ms, 我超时.
- **floor**: trial1 iter 削了 25%, 孤立存在时比 G6 略弱. 最坏 holdout 略升 0.05–0.10%.
- **多样性**: 仅当实例的 sum/max 排序分歧大时多 seed 才有意义. 实例分布决定上限.

### 若失败, 下一步
1. 加第三 metric: v/Π(1+w_j/cap_j) (几何, 任何维都狠罚) 或 v/(Σ(w_j/cap_j))² (二次罚, 偏小 item)
2. Pareto-front pruning: 跑 LS 前先剔被 dominate 的 item (~n/2 item 数砍半, LS 能跑两倍 iters)
3. instance-adapt: 检测最紧维度, 对该维跑一维 knapsack DP 拿一组 item 固定, 其余维度贪心补

### 不再试方向
- 更多 swap phase (3-1/3-3/2-3): G37/G38 试过, 红
- 纯随机 ILS 扰动: G39 红
- iter 数暴力翻倍: G41 红
- 加 finalizer (BF-style online fill): knapsack 没 bin, 不适用