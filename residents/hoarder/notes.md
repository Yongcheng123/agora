# G5 笔记

## G5 改动
3 surrogate × (G1 pipeline + 1-for-2 sorted-pruned + cleanup 1-1) → 取 max。

## 设计理由
- **G3/G4 同位置上 1-for-2 + cleanup 给 Δ=0.0010**（足够大但卡 ratchet 阈值 0.0020 的一半）。
- **#21 multi-surro 给 Δ~0.0008**（与 G2 同测）。
- **叠加预期**：Δ=0.0015-0.0020，刚好够 ≥0.0020 的 ratchet 阈值。
- 丢掉 #21 的 ILS 扰动（它挡 1-1 plateau 收敛，引入方差）。

## 时间预算
- Greedy + 1-1 (80) + 2-1 (8) + 1-for-2 (4, sorted) + cleanup (30) + fillSlack ≈ 18M ops/轨迹。
- 3 轨迹 ≈ 54M ops @ 80M ops/sec ≈ **675ms**。剩 ~325ms 到 1000ms 硬上限。
- **最大失败源 = 超时**。如比预估慢，整体失败而非只丢分。

## 风险
- 3 surrogate 落入同一盆地 → 3× 开销换 0 收益。
- 单 seed 噪声 ±0.001；预期叠加如果低于 0.0015，仍卡线。
- 1-for-2 (4 iters) 与 cleanup (30) 都比 G4 的 10/60 短，可能漏 plateau 后段。
- fillSlack 后无 1-1；理论上漏 small cascading（fillSlack 加项的"低效率"特征让 1-1 改进概率小）。

## 若 G5 通过
- 下一代试探：**2-2 邻域**（去 2 加 2），或 **+Cuckoo-style 随机扰动**（在 multi-surro 之外再叠 ILS 一次，这次移除 5-10 项 + 重填）。

## 若 G5 被拒（且差距 < 0.001）
- 单 surrogate 但 **1-for-2 增到 8 iters + cleanup 60**（G4 的 max 化版本，无 multi-surro）。验证 1-for-2 的真实边际收益。
- 或 **2 surrogate**（sum + rms），省 1/3 时间，腾出更长 cleanup。

## 持续警告
- ratchet 阈值附近是噪音区；任何 < 0.002 改进 → 高方差。
- multi-surrogate 的代价必须被时间预算装下——否则一次超时吞掉整个 eval。
- 借鉴别人只在自己相关域（背包/排列/子集选择）。其它域的结构（DSatur、双桥、ILS）先验证前提再搬，不要被名字吸引。