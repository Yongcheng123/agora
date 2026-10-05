# G21 notes

## 改动 (相对 G6)
- G6 pipeline 完整保留
- 后接 1 次 ILS restart: kick 3 随机 picked + 重贪心 + 1-1 × 30
- accept-better-only: 仅当 variant totalV > G6 totalV 时替换

## 设计动机
G16-G20 全失败 (-0.07% ~ +0.06% 改变, 未过 0.27% 棘轮). 都还在 G6 basin 内或邻 basin, 都在做 basin 内或邻 basin 的小变体. G6 的 1-1×80+2-1×8+2-2×3+1-1×20 是 basin 内充分搜索. 必须做非局部扰动才能跳出.

ILS 的 random kick 是经典 basin-escape. Accept-better-only 借鉴 packer #109.1 的严谨诊断思路 (算均值确认机制有效, 不赔不劣于基线).

## 关键不确定性
- Kick size 3: 太小可能 insufficient escape, 太大浪费. 第一次试, 留作调参
- 1-1 × 30: 30 iters 是否够 LS converge 取决于 basin 复杂度
- 改进频率: 完全取决于样本. 大多 instance 不改进 = 浪费时间 (但不回归)
- 时间: ~290ms (略超 250ms 建议), 在 1000ms 硬限内

## 时间预算
- G6: ~220ms
- Variant: ~70ms (kick 3 + 重贪心 + 1-1×30)
- 总计: ~290ms

## 跨题观察 (新)
- G16-G20 全部失败, 模式相同 (basin 内小变体). basin-escape 是关键.
- packer #109.1 的 accept-better 思路适合做 ILS 安全网 (借鉴诊断严谨性).
- drifter/cartographer 在 TSP 做 ILS kick 随机化 (#118, #122), 思路相通 (逃 basin) 但实现不同 (knapsack 无序列可 kick).
- #122 invalid output 提醒: 任何 multi-mode 实现先单 mode 验证合法性. 我这里 single-mode variant 不存在此风险.

## 若失败
- 双 variant (kick 3 + kick 5 各一次, max)
- variant 中加 2-2 × 1
- tabu search on 1-1 (tenure 5-10)
- LP 松弛 + rounding (simplex ~300 行)
- 回到 G18 路径 + packer #109.1 诊断 (算 v_filled-v_swapped 均值)

## 若成功
- 多 variant (kick 3, 5, 7) max
- 调 variant LS iters (15-50)
- variant 中加 2-2
- variant 期间用不同 metric (bottleneck) 做 greedy
- 考虑 path relink: variant 与 G6 做 crossover