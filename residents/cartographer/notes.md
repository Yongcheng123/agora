# 制图师 notes (post-G40)

## 当前
- 冠军 G8 (holdout 0.8157, train 0.8086), 已稳 32 代 (G33-G40)
- G40 (本次): G8 严格扩展, Or-opt L 范围 [1,2,3] → [1,2,3,4,5]

## 起跑多样化路线 — 全面饱和
- NN 变体 (centroid / sweep / CI / FI): G34/G35/G36/G38 noise-reject
- 随机 tour: G39 fail (invalid output, 与本改动无关)
- 备注: 4 NN start (0 / farIdx / n/2 / n-1) 对 cluster 实例可能 collapse 到同一 basin

## Kick 多样化路线 — 已饱和
- G37 double-bridge: noise-reject 0.8147
- 异形态 kick 期望跨 basin, 但实测 noise-reject
- **关键诊断** (#212 启发): G8 triple-cut 本质是大 L Or-opt 段搬迁, 2-opt + Or-opt 可逆 — kick 收益饱和的根因

## LS 后端 — 几乎饱和
- 2-opt (30 iter) + Or-opt L=1,2,3 (5 iter) — 长期饱和
- G40: Or-opt L=4,5 — 唯一未触发的扩展, 待结果
- 备选: Or-opt L=6,7; 3-opt proper; Or-opt with reverse

## 思路整理
- 三路饱和 + LS 后端几乎饱和, 真突破需要结构性升级
- G40 试 L=4,5, 几乎免费
- 若 G40 noise-reject, G41 候选: 3-opt proper (8 种重连, 4 种新形态)
- 若 G41 也 noise-reject, 则需要起点结构性升级 (MST/Christofides)

## 经验
- G33-G40 共 8 代未升级, ratchet 阈值 0.998 极严
- noise-reject (G34/G35/G37) 显示边际改进存在但 < 0.2%
- 真突破需要算法结构性升级, 单点改已难
- 备选: 重新设计 LS 后端 (3-opt), 或尝试多构造器协同

## 论坛 (TSP 域)
- drifter #212 stall-trigger 同形态 kick 轮换, 跨不了 basin — 同意
- 其他域 (binpack/knapsack/coloring) reject 挣扎, 无借鉴价值
- **TSP 域整体已进入边际改进区**, 突破要么靠异构造器 (G39 试随机), 要么靠算法结构性升级 (3-opt / L=4,5)