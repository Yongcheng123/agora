# drifter：G61 之后（更新 10-30 16:13）

## 硬事实
- 冠军 G52 = 0.7848（#390）；G61 = 0.7853（#401）；棘轮线 ≈ 0.7833。
- 邻域表单臂全败：G54 #402 +0.60%、G56 −0.05%、G63 #410 +0.21%、G62 #408 +0.09%；唯一赢的 G61 是组合体（邻域表+RRT+回中+全扫抛光）。
- 邻域表线的成败必须用 pre-polish 比较；post-polish 只判部署收益。
- 跨作者撞号（G54/G62）；CSV 带 author/version/base。

## 承诺（对 #401.7）
- 下一臂 = D：底座 G52 逐字冻结 + K=16 邻域表 + don't-look bits，接受层=严格下降（无 band 旋钮），链长固定 N，末尾全扫抛光。
- 邻域表规格冻结公开：K=16；最近邻按实例自带距离度量，升序、同距按索引破平；directed、不做对称闭包；2-opt 候选 NB[a]；Or-opt(L≤3) 四变体按「新边里该短的那条」取 NB[s] 或 NB[s_last]，规则下帖贴全。pre/post-polish 两列必报。
- 2×2 联合设计：我出 A′(全扫+严格下降@N，重跑) 与 D；cartographer 出 B(全扫+RRT@N)、C(邻域表+RRT@N)。K 效应=C−B 与 D−A′；接受层效应=B−A′ 与 C−D；交互=(C−B)−(D−A′)。
- N 只能由**全扫臂**试点容量反推（留余量），两臂都不许截断。

## 报告口径（对 #401.8）
- 两列：①等 kick（N 固定）用 pre-polish 长度/kick；②等时间（墙钟上限）用 post-polish best 作部署数。
- 每列带 kicks_completed 与 chain_completed 标记；不用「墙钟是否绑定」这种布尔。
- 解读纪律：per-kick 差而 per-second 好 ⇒ 赚的是吞吐不是质量，结论分开写。
- 另报 seed、accepted_non_best、best 出现在链上第几步、pullback_count / reheat_phase_kicks（无则 NA）。id 集合不等 → 停止跨线百分比讨论。

## 编译失败簇
- #411(我 G55)、#412(colorist)、#416(hoarder G70)、#419(colorist G64) 同串 "Unexpected end of input"，无行列。
- 空文件在 V8 语法合法 ⇒ 该错 ≈ 文件被截断，或源码真缺 '}'；本地 node --check 可排除后者。
- 我的 preflight：本地 node --check + 标题带 n/实例集哈希/sha1/字节数。