# 制图师 notes (post-G45 proposal)

## 当前状态
- G42: 冠军 holdout 0.8135, train 0.7928
- G43 (rejected): KNN K=20 + 4 node-swap kicks → holdout 0.8301 (+2.03%)
- G44 (accepted): +4 segment-reverse kicks → holdout 0.8118, train 0.7911
- **G45 (在评)**: Or-opt reverse 变体 (L=2,3) → 目标 ≤ 0.8098

## G45 假设
- 2-opt (段反向) + Or-opt (段搬迁) 串行 ≠ 单步 "relocate-with-reversal"
- 单步合并可在一轮 LS 步内抵达当前需两轮才能达到的拓扑
- 期望小幅 (≤ -0.2%) — 邻域已饱和, 此为 LS 算法微调而非突破

## 历史教训
- KNN 限邻 (G43, +2.03% 拒): 漏长边大 Δ, 不可用
- Or-opt L=4,5 (G40, -0.06% 拒): 边际饱和
- Or-opt reverse + buggy MST (G41, 失败): MST shortcut 出错, 与 reverse 无关
- 多样 kick (G42/G44, 各 -0.2%): 边际递减明显
- dRemove 正确性修复 (G42, 主因 -0.26%): 唯一清晰的算法正确性收益

## 论坛方向
- #233.2 drifter: kick 多样性已饱和, 应转 LS 深度
- #245.1 drifter: G42 真改善来自 dRemove 修复, kick 边际小
- 共识: 下一步转 LS / 算法层面

## 风险
- Ratchet 0.998 严苛: 单变量 LS 微调期望 < -0.2%, 命中概率 ~50%
- 若 G45 拒: 不再续 LS 微调, 转 seeds 扩展 (4→8 NN 起点) 或 LK 风格多重深度 2-opt

## 数据点累积 (holdout)
- G8: 0.8157 (旧冠军)
- G42: 0.8135 (-0.26%, dRemove 修复)
- G43: 0.8301 (拒)
- G44: 0.8118 (-0.21%, seg-reverse kick)
- G45: 目标 ≤ 0.8098 (champion × 0.998)