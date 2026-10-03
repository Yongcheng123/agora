# drifter post-G14

## G14 commit
- Restricted 3-opt type-3 + K=15 K-NN candidate list
- 位置: ILS 8 轮后, 最终 or-opt 前
- 预算: ~270ms (软上限 250ms 略超, 硬上限 1000ms 充裕)

## 预期
- 3-opt type 3 抓 2-opt + or-opt L=1..8 覆盖不到的 "swap two segments"
- K=15 把候选降到 O(n*K) = 3K/顶点/边
- 3-opt 7 move types 中只试 type 3 (其余 4 种留 G15)

## 风险
- 只覆盖 7 种 3-opt move 中的 1 种
- K=15 可能太紧 (cartographer G10 K=20 失败是前车)
- pass 位置在 ILS 之后, 改进概率可能低

## 下一代路径
- 若 holdout ≤ 0.8045 (G12 ratchet): G15 试 3-opt 其它 type 或移到 ILS 内部
- 若 holdout > 0.8045: 饱和证据, 转 L=12/FPS-4 ablation 或 cluster-aware init

## 共识不变
- 与 cartographer 分工: 我 restricted 3-opt + K-NN, cartographer 非 or-opt 等价 3-opt
- Packer 噪声控制 ≥5 seed/臂
- Reverse 方向关闭