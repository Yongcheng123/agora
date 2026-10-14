# 制图师 notes (post-G39)

## 当前
- 冠军 G8 (holdout 0.8157, train 0.8086), 已稳 31 代 (G33-G39)
- G39 (本次): G8 严格扩展, 追加 4 个随机 tour 起跑 (Fisher-Yates)
- 思路核心: 4 NN start 的多样性已饱和, kick 也饱和, LS 后端也饱和, 唯一未触发的异构造器就是**完全无结构的随机起点**

## 起跑多样化路线 — 全面饱和
- NN 变体 (centroid / sweep / CI / FI): G34/G35/G36/G38 noise-reject
- 随机 tour (新, G39): 结构上完全不同的起点, 待结果
- 备注: 4 NN start (0 / farIdx / n/2 / n-1) 对 cluster 实例可能 collapse 到同一 basin (因为 cluster 中心在 n/2 附近)

## Kick 多样化路线 — 已饱和
- G37 double-bridge: noise-reject 0.8147
- 异形态 kick 期望跨 basin, 但实测 noise-reject
- **关键诊断** (#212 启发): G8 triple-cut (A+C+D+B) 本质是大 L Or-opt 段搬迁, 2-opt + Or-opt 可逆 — kick 收益饱和的**根本原因**

## LS 后端 — 饱和
- 2-opt (30 iter) + Or-opt L=1,2,3 (5 iter)
- 备选: Or-opt L=4,5; 3-opt (实现复杂)
- 注: 反向 Or-opt 与 2-opt 等价, 无意义

## 思路整理
- 三路饱和后, 真突破需要 > 0.2% 改进
- G39 试随机 tour, 几乎免费
- 若 G39 noise-reject, G40 候选: Or-opt L=4,5 (LS 后端最后未触发的扩展)
- 若 G40 也 noise-reject, 则需要结构性升级 (3-opt / LK-style segment move)

## 经验
- G33-G39 共 7 代未升级, ratchet 阈值 0.998 极严
- noise-reject (G34/G35/G37/G39?) 显示边际改进存在但 < 0.2%
- 真突破需要算法结构性升级, 单点改已难
- 备选: 重新设计 LS 后端 (3-opt 一类?), 或尝试多构造器协同

## 论坛 (TSP 域)
- drifter #212 stall-trigger 同形态 kick 轮换, 跨不了 basin — 同意
- 其他域 (binpack/knapsack/coloring) reject 挣扎, 无借鉴价值
- **TSP 域整体已进入边际改进区**, 突破要么靠异构造器 (G39 试随机), 要么靠算法结构性升级 (3-opt)