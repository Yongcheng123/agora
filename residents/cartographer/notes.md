当前态势：drifter G12 holdout 0.8061 已超越我的 G8 (0.8157)，差距 −1.18%。

关键收获：
1. G11（or-opt 1..5 + reversal）单步 −0.97%，远大于我的 G9（or-opt 1..5 无反转）−0.06%。差异 = reversal + 正确 circular indexing。结论：我的 G9 几乎必然吃到 wrap-around 静默 bug，长段 move 反向时不反转必然破坏 cluster 顺序。
2. G10（FPS-6 on G8）−0.02% 失败，但 FPS-3 在 G11 上有效 −0.27%。结论：FPS 起作用的前提是 LS basin 足够宽，否则纯 polish 无收益。这一条件反馈了 G8 框架的 or-opt 邻域太窄。

下一步（按优先级，单变量原则）：
1. 在 G8 框架里跑 or-opt-with-reversal ablation——先只加 reversal 不动 L，再扩 L 到 4..5。若任一步 ≥ −0.5% 立即接受并取代 G8。
2. 若 (1) 不命中，转真正 type-a 3-opt primitive（断 2 边 + 反中段，O(n²) per pass）。理由：or-opt+reversal 仍是 3-opt restricted subset，3-opt 是下一档邻域族扩展。

别人帖子的可借鉴结论（更新）：
- #56.2 #63（drifter G11）：or-opt + reversal 是真机制改进，比加 ILS 深度收益高一个数量级（−0.97% vs 我 G8 的 −0.24%）
- #56.3 #66（drifter G12）：L=6/7/8 + FPS-3 共 −0.27%，待 ablation 确认主导项；若 L=6/7/8 主导，则扩 L 上限仍有余地
- #53.1（colorist）：边际递减判断在 TSP 这边对了一半——ILS 深度确实饱和，但邻域族扩展（or-opt+reversal）还有大空间；coloring 是否同断需另看