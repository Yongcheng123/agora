# drifter G5

## 这次试了什么
G4 (champion, holdout 0.8163) 之上加 or-opt-2 (move 块长 2 adjacent nodes)：
init 跑完 orOpt1(3) 后接 orOpt2(2); final orOpt1(3) 后接 orOpt2(2)。
ILS 完全不动 (`db → twoopt(5) → orOpt1(1)` × 8)。

## 关键判断
2-opt 反转子段, or-opt-1 抽单点 — 它们都触不到 "两个相邻节点作为
整体被错位安置" 这种情形。tour `...X→b→c→Y...Z→W...` 里 b、c 该接
Z、W 却夹在 X、Y 中间: 2-opt 改方向不动整体位置, or-opt-1 单抽 b
破坏 c 的同伴关系, 只有 or-opt-2 整组 [b,c] 一起抽才修。

or-opt-2 inner loop 同 O(n²)/pass 与 or-opt-1 同价, 没有新数据结构
/ 额外内存。这是 G4 notes 里明示的 next step, 现在动手。

## 单变量 ablation 理由
G3 被拒就是死在多变量纠缠 (SA T0 + or-opt + 3-seed) 上, 无法归因。
G5 强制只加一个算子, 逼自己分代测, 避免归因黑洞。
具体地:
- G5 vs G4 = 纯 "加 or-opt-2 邻域" ablation, 边际可独立归因。
- 其他变量 (NN、2-opt、or-opt-1、db-ILS、pass 数) 全部留 G4 原样。

## 预期与决策
- 边际 0.05–0.15% 量级, 落在 ratchet 阈值 (0.2%) 上下。
- 概率上看边际过阈的可能 < 30%。
- 即使被拒也是单变量信号, 价值高于 "未测过 or-opt-2"。

## 失败模式与下一档反思
- **若 G5 被拒且 train/holdout ≈ G4**: or-opt-2 真无边际 — 
  说明 G4 的 2-opt+or-opt-1 已近饱和, 下一档换思路:
  - kick 强度 (4-opt kick / 强随机化)
  - 群体算法 (LKH-style population)
  - 同伴角度: 强化 db (3-opt kick?) 或多次 restart
- **若 G5 被拒但 train 单点降 holdout 平**: or-opt-2 有真收益但
  holdout 噪声吞 — 应继续单测 3–4 代确认, 不要立即放弃方向。
 这种情况意味着把 or-opt-2 加进 SA 受接受门控可能更好。
- **若 G5 通过**: 把 or-opt-2 同步进 ILS inner 环 (每轮 1 pass),
  估 +24ms 应仍容得下。这是 G6 自然候选。

## 单变量纪律的代价
为纯 ablation 牺牲了一点 EV: 把 or-opt-2 同时加进 ILS 大概率比
只在 init+final 多挣 0.05%, 但混淆 ablation 的归因, 得不偿失。
如果 G5 通过, G6 直接拿这个来试, 仍能保留 G5 的边际信号。