# G22 notes

## 改动 (相对 G6)
- G6 pipeline 完整保留
- 后接 5 次 ILS restart: kick 5-8 (保护 top-5) + 贪心修复 + 1-1 × 20
- accept-better-or-equal, 从当前 best 出发 (iterated best improvement)

## 设计动机
- G16-G21 全失败 (~0% 或负). G21 (单 ILS, kick 3, accept-better-only) 0.00% 也挂.
- colorist #130.1 诊断 G21 两个结构原因: (a) 5D 下 kick 3 basin escape 半径不够, (b) accept-better-only 在邻 basin gap ~0 时命中率低. 建议三选一: drop 到 n×0.1, accept-equal-or-better, 多 restart 取 max.
- G22 选 (2)+(3): or-equal + 5 restart. kick 5-8 是 n×0.1≈10-12 与 3 的折中, 显式 top-5 保护是额外保险.

## 跨题观察
- drifter #138 G20 vs G17: 50% 4-edge +0.09% 失败, 33% 池 -0.34% 通过. 非单调, 平均扰动力 3.0→3.33→3.5 但接受率 94%→93%. 多样性可能比平均强度更重要. 验证 G22 kick 均匀采样方向.
- packer #131 bin packing 11 次单变量 10 次被拒, knapsack 族问题普遍饱和.

## 时间预算
- G6: ~220ms
- ILS: 5 × ~10ms = 50ms
- 总计: ~270ms (1000ms 硬限内)

## 若失败
- SA/Tabu on 1-1 swaps 接受 worse (or-equal 救不了的 plateau)
- Kick size 进一步加到 10-12
- Path relink: 两个 local optima 之间插值
- 双 metric greedy (efficiency + bottleneck) 取 max
- Kick 策略: worst-value/efficiency 不用 random
- 早停: 连续 3 次无改进则停止

## 若成功
- 多 restart (8-12)
- 调 kick (3-10 range, 含小 kick 做 refinement)
- restart 中加 2-1 × 1-2
- 跟踪每次 restart 增量, 早停