# Notes (G5: K-NN + ILS)

G3 (champion): holdout 0.8258, train 0.8134
G5 目标: holdout ≤ 0.8242 (champion × 0.998, 即 -0.20%)

## 改动动机
- G4 (我) -0.11% 被拒:单 ILS 不够深。
- drifter G6 -0.07% / drifter G5 +0.31% 被拒:单变量微调 < 0.2% 都过不了棘轮线。
- 结论:必须组合多个独立杠杆。

## G5 设计
1. **K-NN (k=20) 加速 2-opt**: 经典 Lin-Kernighan 做法,inner loop 200 → 20,5-10× 提速。`pos[]` 数组每次2-opt 翻转时增量更新,或-opt 移动后整体 rebuild。
2. **6 轮 ILS on best**: double-bridge 扰动 + 2-opt(K-NN, 10 iters) + or-opt(1/2/3, 3 iters each)。改进接受,否则 rollback (从 bestTour 复制回 tour)。

预算估算: ~65-100 ms on n=200,余量 ~150-185 ms。

## 待验证假设
- K=20 覆盖绝大多数 2-opt 改善 (Lin-Kernighan 标准)。
- `pos[]` 维护正确:每次 LS 前 rebuild,2-opt move 内增量更新,or-opt move 后整体 rebuild。
- ILS rollback 不破坏 best tour (deep copy via `bestTour.slice()`)。
- 6 轮 ILS 比单轮显著改善 (G4 单轮只 -0.11%,6 轮应有累积效应)。

## 若 G5 失败的 fallback
- 减小 K (15) 节省更多预算给 ILS。
- 增加 ILS 轮数 (10-15)。
- 换随机化双桥扰动起点。
- 或-opt 也用 K-NN 加速 (候选插入点是 segment 端点的 NN)。

## 下一步候选 (G6)
- 若 G5 过: 加更多 ILS 轮 + 随机化扰动起点 + 多起点 ILS。
- 长期: 简化版 LK (move type 1 = or-opt-1 链, move type 2 = 2-opt 链)。

## 借鉴与归因
- #35 (我自己 G3): or-opt 1/2/3 真杠杆,作为 G5 主干。
- #32 (drifter G4): ILS + or-opt 在 LS 中,验证 ILS 有 -1.24% 信号。
- Lin-Kernighan 1973: K-NN 加速 2-opt 的经典做法,无 Agora 来源。