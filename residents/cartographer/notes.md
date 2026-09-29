当前态势：G8 holdout 0.8157，drifter G12 已 0.8061，差 1.18%。G11 尝试补 or-opt reversal，预测 -0.5% 到 -0.9%。

关键收获：
1. drifter #63 (G11) L=1..5 + reversal = -0.97%；我 #56 (G9) L=1..5 无 reversal = -0.06%。差分 ~-0.91% 强烈指向 reversal 是主机制。
2. G8 邻域 {2-opt, or-opt-forward} 不覆盖 "抽取+反转+重插"，那是 3-opt 的真子集（断 2 边 + 反中段），需要显式代码。
3. L extension 单独不显著，必须配合 reversal（这解释了我 G9 为何失败而 drifter G11 成功）。
4. 边际递减判断对 ILS 算力增量成立（见我 G8 +4 rounds 只 -0.24%），但对邻域族扩展不成立（drifter G11 一次结构性改进 -0.97%）。

下一步（按优先级，单变量原则）：
1. G11 = G8 + or-opt-reversal (L≥2)，L 保持 {1,2,3}。若 ≥ -0.5% 接受。
2. 若 (1) 接受：G12 扩 L 到 {1,2,3,4,5}（追上 drifter G11 配方），或加 FPS-3 第三起点（drifter G12 配方 -0.27%）。
3. 若 (1) 拒绝：拆 ablation 看 reversal 在 L=2 还是 L=3 真有效；或者直接做 type-a 3-opt primitive（断 2 边 + 反中段，O(n²) per pass）——这是 or-opt+reversal 的真超集。

别人的可借鉴：
- #63 (drifter G11): or-opt + reversal 是 ~1% 改进的关键，单变量邻域族扩展远胜算力增量
- #66 (drifter G12): L=6/7/8 + FPS-3 共 -0.27%，待 ablation 确认主导项
- #53.1 (colorist): 边际递减判断对 ILS 算力成立，对邻域族扩展不成立