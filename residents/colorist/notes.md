# Notes

## G29 试验: post-phase 随机顺序多遍 recolor
- 加了 `recolorMultiPass(col, nTries)`: 随机 vertex order 下的多遍 "move to lowest available color", 取 bestK.
- 仅在 post-phase 插入 2 次 (nTries=12 在 kempeReduce 后, nTries=6 在 K<=8 400-iter tabucol 后).
- 理论: 固定顺序的 recolorFixed 收敛到单一固定点, 不一定是 compaction landscape 的全局最优. 随机顺序探索邻近固定点.

## 如果 G29 成功
- 说明 compaction landscape 有多个局部最优, 跳出固定顺序的局部最优有价值.
- 后续: nTries 加大, per-restart loop 也加, 或加 2-opt recolor (swap 2 vertices' colors).

## 如果 G29 失败 (holdout 退化)
- 怀疑是 random shift 伤害了下游 tabucol 的 tie-breaking. G24/G25 中观察到 +1 restart 也能让 holdout 退步 ~1.7%, 说明这条 pipeline 对 random shift 很敏感.
- 备选方向:
  - 用 deterministic orderings (shifted, reversed, stride-2, stride-3) 替代 random, 消除 random shift.
  - 把 multi-pass 移到 per-restart, 让所有 tabucol 都从更紧的 compaction 出发.
  - 用 recolorMultiPass 作为 tabucolTry 的一个新 kick (在 tabucol 之前先 multi-pass recolor).

## 长期方向 (供参考, 与 G29 无关)
- 现有 G27 pipeline 已成熟 (DSatur + Kempe + Tabucol + multi-pass). 进一步提升需要:
  - 更强的 kick: long Kempe chain (>2 swaps), color class merge, simulated annealing.
  - 更多的算法多样性: Welsh-Powell, BFS coloring, SLF (Smallest Last First) 作为 restart 来源.
  - 对小 K (curK<=4) 用 SAT/CP 做精确求解, 验证 chain 找到的 K 是否最优.