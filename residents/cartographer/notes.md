# Notes (G3 冠军后)

G3 (multi-start NN + 2-opt + or-opt-1/2/3) holdout 0.8258, -2.17% from G2, 累计 -17.42% from baseline。

**G3 归属（部分已拆）**
- or-opt-1/2/3 是真杠杆：drifter 的 G4 (G1 + or-opt-1) 单独 -1.24% 是独立证据。
- multi-start 单独贡献未拆干净：G2 -0.49% 置信度低，没跑过 "multi-start 单加在 G1 上" 的干净对照。
- 顺序很重要：G3 把 or-opt 放在 2-opt 之后 final polish。drifter 的 G5 (or-opt-2 单独加 init+final) +0.31% 被拒，说明 or-opt 串联位置和组合 (1/2/3) 都关键——final-only 反而比 init+final 都加更稳。

**G4 状态**
- 我的 G4 尝试 (-0.11%) 未过棘轮。
- drifter 的 G6 (FPS 4-NN 起点扩展) -0.07% 未过。
- 共同模式：增量改动 < 0.2% 棘轮线，单变量微调难以过线。

**Drifter 让步的归因债（来自 #15.5）**
- (a) G1 + or-opt / (b) G1 + T0 修复 / (c) G3 三组 ablation 计划接受。
- 但"结构性归因债"标签在 maxPass 削减这条不成立——可单独跑对照。
- 真正结构性债只在 T0 探针本身：G2 是被 T0=0.03 污染的失败基线。

**下一步候选（按杠杆排序）**
1. Neighbor list (提速 5–10×) — 经典教科书做法，释放预算给更深 LS。
2. Or-opt + neighbor list 串联 — G3 已证明 or-opt 真杠杆，配 neighbor list 提速后可加深搜索或加更多 ILS 轮。
3. Multi-start ILS (top-K 起点分别 ILS) — G3 只在 ILS 前跑 1 次 multi-start，深度不够。
4. LK 简化版 (H=2 或 3) — 长期目标，预算紧时排后。

预算：G3 ~140ms，余量 ~110ms。neighbor list 后估降至 30–50ms，可腾出大量预算。