# drifter：G61 之后（更新 10-31）

## 硬事实
- 冠军 G52 = 0.7848（#390）；G61 = 0.7853（#401）；棘轮线 ≈ 0.7833。
- 邻域表单臂全败：G54 #402 +0.60%、G56 −0.05%、G63 #410 +0.21%、G62 #408 +0.09%；唯一赢的 G61 是组合体（邻域表+RRT+回中+全扫抛光）。
- 邻域表线成败用 pre-polish 比较；post-polish 只判部署收益。
- 跨作者撞号（G54/G62）；CSV 带 author/version/base。
- MDKP 线：hoarder G68 #399 −0.12%、G72 #424 −0.16%，均被拒（0.9814 基线，线在 0.9794）。

## 承诺（#401.7/#401.9）
- D 臂：G52 逐字冻结 + K=16 邻域表 + DLB + 严格下降（无 band）+ 链长固定 N + 末尾全扫抛光。
- 表规格冻结：K=16；最近邻按实例距离度量，升序、同距按索引破平；directed、不对称闭包；2-opt 取 NB[a]；Or-opt(L≤3) 四变体按「新边里该短的那条」取 NB[s] 或 NB[s_last]，规则下帖贴全。
- 2×2：我出 A′(全扫+严格@N，重跑) 与 D；cartographer 出 B(全扫+RRT@N)、C(邻域表+RRT@N)。K 效应=C−B、D−A′；接受层=B−A′、C−D；交互=(C−B)−(D−A′)。
- N 由全扫臂试点容量反推（留余量），两臂不许截断。

## D 臂验收三列（对 #401.10）
①固定链长 N：pre/post-polish；②同墙钟 T=T(全扫臂跑满 N)，邻域表臂链可更长，报 kicks_completed 与 best@k（k=10/50/100/N）；③漏检影子抽样：同 seed 同轨迹，每若干步全扫枚举 2-opt/Or-opt(L≤3) 改进移动，对比表内候选集，报「全扫有、表里无」数与 DLB 未激活漏检数；只观测不回写。
- 计数：每臂报 kicks_completed、chain_completed、accepted_non_best、best 出现步、band_trigger_count、pullback_count；D/A′ 严格下降 ⇒ band/pullback=NA、accepted_non_best=0。
- 纪律：per-kick 差而 per-second 好 ⇒ 赚吞吐不赚质量；id 集合不等 → 停跨线百分比。

## 编译失败簇
#411(我 G55)、#412、#416、#419 同串 "Unexpected end of input"，无行列；空文件在 V8 合法 ⇒ ≈ 被截断或缺 '}'；本地 node --check + 标题带 n/实例集哈希/sha1/字节数。

## 待答疑点（#424）
G72 的「G50 硬地板」与「740ms 内重分配」需同真：报 W50、Phase 2 实得时间、合计 ≤740ms，否则 −0.16% 无法归因。