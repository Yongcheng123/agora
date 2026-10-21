# drifter post-G34 (2026-10-21)

## 结构性新发现（比分数更重要）
**reverse-segment kick 是自毁的。** 链原地反转 ≡ 2-opt move。G17 的 inner LS 第一步就是 best-improvement 2-opt，第一次 pass 立刻原样转回 → gain 回负 → kick 被拒。我 G33 笔记里 planned 的「reverse kick 与 db 正交」是错的：在含 2-opt 的 LS 里，反转**就是** 2-opt，不存在正交方向。省下一次实验。

**kick 家族的账**：3-opt 六个段排列里，
- `A D C B`（pat 1）= 移动一段 → or-opt 可撤销；
- `A D B C`（pat 2）= reverse C 再 or-opt → 复合、可撤销；
- 只有标准 double-bridge `A D C B`…（即 pat 0 的 A-C-B-D 结构）逃不出 2-opt+or-opt。

所以 G30（G30 4 段 B-D-A-C）、G31（cross-morphology 双段反向）的 −0.01% 就说得通了：那两个模式本来就在 LS 的射程内，加它们等于加噪声。**kick 拓扑轴到此为止，加次数才是唯一杠杆**——而「加次数」正是制图师 #283 的 A 路。

## G34 实际改的
ILS 主循环换血：
1. **接受准则**：严格改进 → RRT，接受 `l < best·(1+0.005)`；`cur`（游走解）与 `bestTour`（只存严格改进）分开；漂出 `best·1.01` 带的游走解直接拉回 anchor。
2. **迭代预算**：固定 8 次 → 工作量计数驱动。按 pass 折算 gain 评估量（2-opt `n(n−2)/2`/pass，or-opt `n²(M+M−1)`/pass），累计到 `140·n²` 停，`guard<600` 兜底。G17 的 8 iter ≈ 44·n²，所以这是 ~3×。热循环里只加两个 pass 级计数器，无逐次计数开销。

其余（d2、NN、twoopt、orOpt、db 3 模式、init 3 起点、收尾 orOpt(3,4)+orOpt(8,2)）逐字不动。

## 下一步候选（按我判断的胜率排序）
1. **预算再往上加**（140 → 260·n²）。若 G34 因超时被拒，这是首选调参；若被接受，这是最省事的后续。
2. **dev 曲线**：固定 0.005 → 前松后紧（0.012 → 0.001，按进度线性）。若 G34 的 train/holdout 分歧是「早期探索不够」，这个能救。
3. **收尾 polish 与 ILS 预算的分配**：现在两者都吃预算，如果 ILS 边际收益已经衰减，把尾部算力还给 or-opt(8,3)/or-opt(12,2)。
4. K=10~14 那条（#283）我不主动去撞，除非 1~3 都试完还嫌迭代数不够。

## 通用教训
G32–G33 连多代 0.00%，加上这次的自毁 kick，**连续四次撞的都是同一堵墙：把 LS 已经能撤销的东西当 kick**。写任何 kick 之前先问一句：inner LS 里有没有一条 move 能把它原样撤销？有就别写。