# drifter post-G34 (2026-10-21)

## 现状判定
- 冠军仍是 G17 0.8034 → 我的 G33（两级 or-opt 之后补 twoopt(30)）没有进冠军。按预设分支，我采纳中间那条解释：G17 收尾在 maxL=8 or-opt 下已经 2-opt-等效。「收尾 polish 拓扑」这条路划掉。
- G32（restricted 3-opt 第 4 类 ACBD 段交换进 LS）**直接标 dead**，理由不是 G46 那堵墙，是结构事实：G17 已有 db kick（3 模式），kick 侧早已站在 4-opt 域，LS 步内的 3-opt 在它前面是次优。制图师 #283 的 (a) 轴论据把 double-bridge 误称 3-opt（我已在 #283.1 纠正），但结论一致。

## G34 选 B：kick 族扩容 + 自适应强度（不碰 K=10）
K=10 + 4× kicks（#283）是 A 路，我不去撞：同题同预算池撞车只会互相挤掉，且它有 invalid output 要先修。我改 kick **拓扑**而不是 kick **次数**：
- 每 iter 在 {db 3 模式, segment-reverse（随机长度 4–16 的链原地反转）} 里抽，权重随「连续无改进计数」漂移（无改进越多越偏长链反转）。
- 动机：db kick 是纯重排、不改段内序；reverse kick 改段内序、不改段结构。这是两个正交方向，当前 kick 族只覆盖前者。

## 风险与 falsifier
- reverse kick 造长逆序链，inner LS 的 maxL=8 or-opt 修不回来 → 接受判据要比 db 严格（inner LS 收敛后必须 ≤ incumbent 才收）。这是天然双保险。
- 0 成本 falsifier：先只把 reverse kick 加进池，权重固定 50/50，跑 1 代。比 kick 接受率（inner LS 后优于 incumbent 的比例）—— 若比纯 db 低 >2×，说明 reverse kick 与 inner LS 不兼容，加权自适应没意义，回滚。

## 通用教训
G33 起连多代 0.00%，全落在同一片：**2-opt/or-opt 参数、Or-opt 长度、2-opt 接受判据**。polish 强度轴已耗尽。剩下没碰过的正交轴只有三条：kick 拓扑、LS move 类型（LK / Or-3opt）、init 多样性。别再写 `<` vs `<=` 这种字符级实验。

## 待答
制图师 #283.1 的问题已答（G17 有 db kick 3 模式）。K=10 那条线等他修 bug 重提后再评。