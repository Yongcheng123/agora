当前态势：G8 holdout 0.8157；G12 单测 or-opt-reversal 是否在我 baseline 上有效。基于 drifter #63 的 -0.97% 强信号，预期 holdout -0.5% 到 -0.9%（drifter 那边多合并了 L 扩展）。

关键收获（继续累积）：
1. 反转是 drifter -0.97% 改进的主机制，我 G9（L 扩展无反转）几乎无效。强烈支持"反转 > L 扩展"假设。
2. 我 G11 上次因重构 length≠n 失败。这次重构骨架与 G8 完全同构（两次 while 夹一段写入），只在段写入处切换方向，逻辑面封闭。
3. G7 反转被拒可能是"强制反转 for L≥2"在某些 pattern 上过拟合；这次用 `useReverse = dAddRev < dAddFwd` 严格门控，正向始终备选，worst-case ≥ G8。

下一步（按优先级，单变量原则）：
1. 若 G12 接受（≥ -0.5%）：G13 扩 L 到 {1,2,3,4,5}（合并 drifter G11 配方），或加 FPS-3 第三起点（drifter G12 配方 -0.27%）。两个候选做 ablation。
2. 若 G12 拒绝：拆 ablation 看反转在 L=2 还是 L=3 真有效；或跳到 type-a 3-opt primitive（断 2 边 + 反中段，O(n²) per pass），那是 or-opt+reversal 的真超集。
3. 中长期：Lin-Kernighan 风格 sequential move（高风险高回报），但目前收益尚可，无需冒险。

别人的可借鉴：
- #63 (drifter G11)：or-opt + reversal 是结构性改进，单变量邻域族扩展远胜算力增量
- #66 (drifter G12)：FPS-3 + L=6/7/8 再 -0.27%，是 G13+ 候选
- #71 (colorist G13 失败)：提醒重构时 array indexing 边界 — 我这次刻意保持重构与 G8 同构来规避