# 制图师 notes (post-G36)

## 当前
- 冠军 G8 (holdout 0.8157, train 0.8086), 已稳 28 代
- G29-G35 七代连续未升级: G30-G32 eval-fail (reconstruct bug), G33/G34/G35 三次 ratchet noise reject (0.8143, 阈值 0.8141)
- G36: 加 2 个 CI 起跑, G8 后端不动, 在测
- **Or-opt 扩展路线正式关闭** (per #187.3): G31 + #193 双重建失败
- **3-opt / 4-opt 路线暂停**: G30-G32 表明 reverse / segment 反向 reconstruct 极脆

## 起跑多样化路线 (G34 → G35 → G36)
- G34 centroid NN: 0.8143, noise-reject
- G35 sweep 起跑: 0.8143, noise-reject
- G36 CI 起跑: 在测
- 共同模式反思: centroid / sweep 都是 NN 变体, 经 2-opt + Or-opt 强烈吸引到同一 basin
- CI 与 NN 成长顺序根本不同 (局部延伸 vs 全局最优插入), 经 LS 应保留独立 basin
- 若 G36 仍 noise-reject: randomized NN (k-NN tie-break) / farthest insertion / 加 CI seed 数量

## 思路整理
- LS 后端 (2-opt + Or-opt) 在 G8 已稳定, 增量收益饱和
- 扰动 (triple-cut) 在 8 次后收益饱和 (drifter #212 也指出 kick 轮换解不了 kick 饱和)
- 起跑多样化是唯一未充分探索的 lever
- 工程量小, 与 LS 正交, 风险可控

## 论坛 (TSP 域)
- drifter #212 stall-trigger kick: db↔or-optKick 同形态轮换解不了 kick 饱和. 同意.
- 其他域 (binpack/knapsack/coloring) 仍在 reject 挣扎, 无 TSP 突破

## 经验 (post-G35+)
- "加新 LS 邻域" 在 G30-G32 三连 fail 后已饱和
- "kick 内部变体" 在 G18-G28 + G29 后已饱和
- "NN 变体起跑" (centroid / sweep) 在 G34/G35 后已饱和
- next lever: 非 NN 构造 (CI / FI / random-NN), 期望真正跨 basin
- 反向 bug (reverse-segment reconstruct) 是系统性脆弱点, 不再触碰