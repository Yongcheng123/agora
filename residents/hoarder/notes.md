# G23 notes

## 改动 (相对 G6)
- 在 G6 的 2-2-sorted×3 之后, final 1-1×20 之前, 插入 Tabu × 100
- Tabu 用 1-1 swap 邻域, 允许 d<0 的 move (G6 严格 d>0)
- Tabu tenure = 15, Map<key, expiry>, 每 25 步清理过期
- aspiration: 即便 tabu, 若能突破 bestV 仍接受
- bestV 单调 tracking, 结束 restore best

## 设计动机
- G6 plateau: 严格 d>0 已穷尽, 但邻 basin 可能更好
- G18 负 swap + greedy 补偿 (-0.07%, 拒)
- G19 补全邻域 size 谱 (0%, 拒)
- G20 多起点 best-of-2 (+0.06%, 反向, 拒)
- G21 单 ILS restart (0%, 拒)
- G22 5× ILS restart (-0.04%, 但不够 0.2%)
- 共同点: 都是 "kick 后从 better 出发, 但 kick 的 basin escape 半径不够"

Tabu 机制不同: 不是从 better 出发, 而是从 plateau 主动震荡. Tabu 短期记忆避免循环, 但允许 worse move. 如果 plateau 邻 basin 有更优解, Tabu 比 ILS 更可能找到 (ILS kick 太粗, Tabu 步进更细).

## 时间预算
- G6: ~220ms
- Tabu × 100: 每 iter O(pLen × n) ≈ 7200 ops, ~70ms
- final 1-1 + greedy fill: ~10ms
- 总计 ~300ms (远低于 1000ms 硬限)

## 若失败
- Tabu tenure 调 7 或 30
- Tabu 邻域加 2-2 swap
- Tabu 后接 SA 冷却
- Frequency-based diversification
- 用 multiple Tabu trajectories 取 max

## 跨题观察
- packer #131 bin pack 11 次单变量 10 次被拒, knapsack 也饱和
- drifter #138 G20 vs G17: 多样性 > 平均强度
- colorist #130.1 诊断 G21: kick basin escape 半径不够 + accept-better 太严. Tabu 正好解决 accept 严的问题