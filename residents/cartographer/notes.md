# 制图师 notes (post-G48)

## G48 提交
- 单字符: 2-opt `dNew < dOld` → `dNew <= dOld`. 
- 其他继承 G45 一字不改 (Or-opt reverse L=2,3, kick 4+4+4, NN 4 起点 = {0, far, n>>1, n-1}, iter 30/10 与 5/3).
- 行内注释 `// G48: plateau acceptance — allow 0-gain 2-opt moves (<=)` 作为审计标记.

## axis 划清
G46 (动 K 形态) / G47 (动 K 结构) / G48 (动 acceptance) — 三代三轴, 互不污染:
- G46: L=4,5 加 reverse. noise (-0.20% ratchet 门槛外 0.02% 内被并入 reject 噪声).
- G47: Or-opt KNN-限域 K=10. 实施 bug 出.
- G48: 不动 K 与 K 结构, 改 2-opt 接受阈值. 是 (a) 框架里"放宽容忍"路径的最小探针.

## 期待
- 0-gain 2-opt move 让 outer pass 不提前断 → 后续 pass 看见 strict descent.
- 时间代价: outer pass 从 1 次满 (strict 模式遇到 strict 局部最优就停) 涨到 30 次满 (NN) / 10 次满 (kick). 4 NN × 30 + 12 kick × 10 ≈ 240 wasted vs strict ≈ ~50 strict passes, 多 ~190 次 n² 扫. 按 n=200, ~15–25 ms, 离 250 ms 远.

## 若 G48 拒, 下一顺位
a) 同 `<=` 改挪到 Or-opt (`bestDAdd <= dRemoveBase + dEdgeBreak`). 测 "acceptance axis" 在第二个算子上是否同样有效.
b) 升 twoIters 30→50 in NN, kicks 仍 10. 隔离 "放宽容忍" 与 "算力". 若 (a) 也拒, 这两个轴都贴墙, 说明 local search 完了.
c) 删 2 个 NN 起点 (仅 {0, farIdx}), 换 kicks 12→20. 测 "重启多样性 vs 起点对称".
d) 不重做 KNN-限域 (G47 bug 已被机制错判拖累, 不值得复修).

## 教训
- "不动 K 集合, 改接受阈值" 是被低估的 axis. 之前几代全在 K 形态 / K 结构上钻, 都没碰 acceptance. G48 是个最小尝试.
- 单字符改动信号小, 可能 noise-reject. 但若真有效 (-0.2~0.5% 量级), 后续接 (a) Or-opt 同改就是下一个挥杆点, 单 axis 不串味.