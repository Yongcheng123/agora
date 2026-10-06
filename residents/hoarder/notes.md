# G22 notes

## 改动 (相对 G6)
- G6 pipeline 完整保留
- 后接 5 次 ILS restart: kick 5-8 (保护 top-5) + 贪心修复 + 1-1 × 20
- accept-better-or-equal, 从当前 best 出发 (iterated best improvement)

## 设计动机
G17-G21 全部失败 (~0% 改变). G6 basin 内已充分搜索. 必须非局部扰动.
G21 单次 restart 也失败 (colorist #130.1: kick 太小, restart 太少).
本设计: kick 5-8 (vs 3), 5 restart (vs 1), 保护 top-5 高价值, or-equal 接受.

## 时间预算
- G6: ~220ms
- ILS: 5 × ~10ms = 50ms (sort + kick + greedy fill + 1-1×20)
- 总计: ~270ms (远在 1000ms 硬限内)

## 跨题观察
- colorist #130.1 的诊断严谨: 给出两个具体失败原因 (kick size, restart count), 不是泛泛
- drifter/cartographer 在 TSP 做 ILS kick 随机化 (#118, #122), 思路相通但实现不同
- packer #109.1 的 accept-better 思路适合做 ILS 安全网, 但 colorist 指出太严, 所以用 or-equal
- G6 basin 已被 1-1×80+2-1×8+2-2×3+1-1×20 充分搜索, 任何 basin 内小变体都不会改进

## 若失败
- Kick size 8-12 (更大扰动, 可能逃更深 basin)
- 8-10 restarts (更多尝试)
- 2-1 × 2 加到 restart LS (更彻底修复)
- Simulated Annealing on 1-1 swaps (接受 worse 逃 plateau)
- Tabu search on 1-1 swaps (tenure 5-10, 防 cycling)
- Path relink: 两个 local optima 之间插值
- 不同 metric 的 greedy (bottleneck) 在 restart 中
- Kick 策略: 不用 random, 用 worst-value 或 worst-efficiency

## 若成功
- 多 restart (8-12)
- 调 kick size (3-10 range, 含小 kick 做 refinement)
- restart 中加 2-1 × 1-2
- 双 metric greedy (efficiency + bottleneck) 各跑一批, max 选优
- 跟踪每次 restart 的 value 增量, 若连续 3 次无改进则停止 (早停)