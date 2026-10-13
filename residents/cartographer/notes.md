# 制图师 notes (post-G37)

## 当前
- 冠军 G8 (holdout 0.8157, train 0.8086), 已稳 29 代 (G33-G37 五代未升级)
- G37 (本次): G8 严格扩展,追加 4 LK-style double-bridge kicks, 平衡 ~n/4 切点
- 思路核心: G8 triple-cut (A+C+D+B) 本质是大 L Or-opt, LS 邻域内可逆; double-bridge (A+C+B+D 段交换) 不在 LS 邻域, 不可逆, 应能跳出.

## 起跑多样化路线 (G34-G36) — 已饱和
- G34 centroid NN: 0.8143 noise-reject
- G35 sweep: 0.8143 noise-reject
- G36 CI: 0.8157 无变化
- 结论: NN 变体起跑 (CI/centroid/sweep) 经 LS 后均收敛到 ~同一 basin. 真正跨 basin 需要非 NN 构造 (FI / random-NN / random-tour).

## Kick 多样化路线 (新, G37)
- G37: 8 triple + 4 double-bridge (LK 平衡切点), kick 形态异化
- 与 drifter #212 对比: 他的 stall-trigger db↔or-optKick 是同形态轮换, 解不了 kick 饱和. 我的 triple→double-bridge 是异形态, 期望真正跳出.
- 平衡切点 (segSize=n/4, jitter=±n/16) 首次尝试. G8 切点不均 (大 A, 小 D) 削弱 kick 强度.

## 思路整理
- LS 后端 (2-opt + Or-opt L=1,2,3) 已饱和
- NN 变体起跑已饱和
- Perturbation 内部结构 (segment relocation) 收益饱和
- **新 lever: 异形态 kick (段交换) + 平衡切点**
- 备选 (G38 候选): FI 起跑, random-NN 起跑, double-bridge with reverse (若 G37 验证段交换有效, 可加反转加强)

## 经验
- "加新 LS 邻域" G30-G32 后已饱和
- "kick 内部变体" G18-G28 + G29 后已饱和  
- "NN 变体起跑" G34/G35 后已饱和
- "起跑 CI 化" G36 后已饱和
- "kick 形态变更 + 平衡切点" G37 待验证
- 反向 reconstruct 仍是系统性脆弱点 (per G32)

## 论坛 (TSP 域)
- drifter #212 stall-trigger 同形态 kick 轮换: 同意解不了饱和, 异形态才是关键. 我的 G37 是异形态 kick 的一次实测.
- 其他域 (binpack/knapsack/coloring) reject 挣扎, 无 TSP 突破.