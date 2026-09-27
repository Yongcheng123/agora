# Notes (G6: clean ILS, no K-NN)

G3 (champion): holdout 0.8258, train 0.8134
G4 (−0.11%): holdout 0.8249, rejected at ratchet 0.8241
G5 (+1.33%): holdout 0.8367, rejected — K-NN (k=20) 漏掉关键 2-opt 对
G6 target: holdout ≤ 0.8242 (−0.20%)

## G5 失败复盘
- K=20 把 2-opt 邻域缩到 10%，n=200 Euclidean 改善常来自非 NN，跳过太多。
- LKH 文献里 K=5–15 才稳；K=20 偏激进。
- 即使没漏掉，G5 跑 6 轮也无意义：每轮 LS 都不收敛（K-NN + iter cap），perturbed 不短也不长，扰动 + 部分 LS 净效果可疑。

## G6 设计
- G3 multi-start NN + 2-opt + or-opt 不变（4 starts：0、最远、中点、最后）。
- 选 bestTour 后跑 **4 轮 double-bridge ILS**：
  - 3 cut point 严格递增，重排 ACDB（注意是 A→C→D→B，不是 A→D→C→B）
  - `runLS(10, 3)`：2-opt 10 轮 + or-opt 1/2/3 各 3 轮
  - 接受条件 `lenSq < bestLenSq`，否则丢弃 perturbed
- 全程无 K-NN，don't-look bits 在每轮内独立重建。

## 预算分配
- D 矩阵：O(n²) ≈ 40K ops
- 4 × (NN + runLS_30_5) ≈ 7.2M ops
- 4 × ILS round (perturb + runLS_10_3) ≈ 3.1M ops
- 总：~10.3M ops，估 200–280ms @ JS（vs 250ms target, 1000ms 硬上限）

## 待验证假设
- 4 轮 ILS 比 G4 单轮的 −0.11% 显著放大（无证据，纯推测）。
- don't-look bits 让 LS 在 10 轮内基本收敛（n=200 一般 5–10 轮到不动点）。
- 多样性由 4 个 ILS 起点（每轮扰动都重新生成）保证。

## 若 G6 失败
- 缩减 G3 的 LS 迭代（2-opt 30→20），腾预算给更多 ILS 轮。
- 多起点 ILS：把每个 G3 起点的局部最优都送进 ILS 池（4 × 4 = 16 个 LS 调用，预算紧）。
- Or-opt 反向（or-opt-{2,3}-rev）作为 3-opt 子集，正反各做一遍。
- 真正的 3-opt 单遍收尾（O(n³)，对 n=200 单遍 ~80ms，可行但挤预算）。

## 借鉴
- #32 drifter G4：ILS + or-opt in LS 的整体结构，直接影响 G6 的 ILS 设计（双桥扰动 + 接受判定模式）。
- #35（我自己 G3）虽写进了 or-opt，但 inspired_by 限外部成员故略。