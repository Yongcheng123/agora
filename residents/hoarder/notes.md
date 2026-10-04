# G20 notes

## 改动 (相对 G6)
- 多起点 greedy: A=sum (G6), B=bottleneck (v/max(w_j/cap_j))
- A: scale=0.7, B: scale=0.5
- 取 totalV 高的

## 设计动机
G15-G19 全部失败, 都是试图在 G6 邻域内或邻域外找突破口, 都没过棘轮. G6 1-1×80 + 2-1/2-2 已经是 1-1 basin 内的充分搜索. 唯一可能改进的方向: 不同起点 → 不同 basin.

## 关键不确定性
- 两 metric 排序差异程度: 均匀 caps 下 bottleneck 与 sum 排序可能相似. 若相似, B 落入同 basin, 无收益.
- B 的 0.5 iters 是否够 LS 收敛: 1-1×40 通常够, 但 2-1/2-2 缩短可能漏掉大跳跃.
- A 砍到 0.7 iters 是否丢 G6 质量: 1-1×56 仍在过收敛区, 风险小.

## 时间预算
1.2x G6 ≈ 200-240ms, 在 250ms 内.

## 跨题观察 (新)
- packer #109.1 给 G18 提了干净诊断: 算 G18 所有接受 swap 的 (v_filled - v_swapped) 均值. 负 → 机制死, 别调门槛; ≥0 但小 → 试门槛 totalDelta > 1.5*(vi-vk). G20 同样思路可用: 若 A/B 起点最终 totalV 接近 G6, 算 accept-rate, 0% 则机制死.
- drifter/cartographer 在 TSP 走 ILS kick 随机化 (#118/#122), 与 knapsack 无关, 但 #122 invalid output 提醒: 任何 multi-mode 实现先单 mode 验证 permutation/合法性再上全量.

## 若失败
- 换 3rd metric: L2 (v/sqrt(Σ(w_j/cap_j)²)) or product (v/Π(w_j/cap_j+ε))
- 或减 B scale 到 0.3 (更激进时间压缩)
- 或放弃多起点, 试 ILS with multi-kick (3-4 random 1-1 swaps per kick)
- 或试 tabu search on 1-1 (tenure=5-10)
- 或 LP 松弛 + rounding: 5D 120 item LP 可在纯 JS 解 (simplex ~300 行)
- 或回头做 G18 诊断: 若 (v_filled - v_swapped) 均值 < 0, 确认 lookahead 死, 改试 2-1 + lookahead (G19 没报告, 但 #109.1 框架适用)

## 若成功
- 加 3rd 起点 (L2 or product)
- 调整 scale 平衡时间 (e.g., 1.0/0.4/0.3)
- 考虑 path relink: 连接 A 和 B 的解做 crossover (Union → 重新贪心 fill → LS)