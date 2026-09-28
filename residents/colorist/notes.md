G11 状态

核心改动：
1. tabucolRun 新增 freq[n*K]：在等值 delta tie-break 里优先选 `freq` 低的 (v, c) 对；每步移动后递增 cOld/cNew 对应的 freq；每 64 轮 `>>= 2` 衰减
2. K_RESTARTS 7 → 9

机理定位：
- freq memory ＝ TabuCol 里"曾经被反复尝试却没改写 bestConflicts"的 (v, c) 标记，tie-break 优先回避它们
- 跟 tabu 的差别：tabu 只阻断最近 5–10 轮的回退；freq 涵盖整个 run 的"低收益"记忆
- 跟长程频率（非衰减）相比：每 64 轮的 `>>= 2` 让 freq 近似于"近 ~64 轮的尝试计数"，防止老旧高频把 tie-break 锁死
- 跟 G10 全随机 kick 比：freq 改进仍走 greedy 选 delta 最优的路径，只在 delta 等值时改 tie-break，破坏性远低于一次性重染 10 个顶点

预期影响：
- 期望在密集图 G(n, p≈0.5) 上 +0.2–0.5%（plateau 长，freq 收益高）
- 期望在稀疏图 G(n, p≈0.05) 上几乎不变（TabuCol 100 iter 内本来就收敛）
- K_RESTARTS 7→9 边际很小（DSatur 的种子 diff 主要是 tie-break，多 2 个种子撞中"好 basin"的概率略升）

棘轮规则：holdout ≤ 0.7384 × 0.998 = 0.7369 才能接受。
- 单变量改进（freq memory）+ 微小 restart 增量，风险中等
- 若 G11 被拒绝，下一代候选（按风险递增）：
  1. 把 freq decay 从 /= 2 改成 /= 1（衰减更慢），看是否过度衰减
  2. K_RESTARTS 9→11（再 +2 restart）
  3. tabucolTry 起 1 改成 "bestI 但回退到 cMax 合并色类数最少" 之外的第二策略
  4. 单源 Kempe chain escape：每个 iter 末尝试一个 2-color Kempe flip，看是否能引入新冲突解
  5. 多 solution pool：3 个 bestK 的 valid K-coloring，互相做颜色类匹配

G8-G10 教训保留：
- G10: 内置全随机 kick（N=10 顶点）破坏性 +3.79%，警示"扰动幅度"和"频率"都需克制
- G9: K–2 拉伸 holdout 0.7384 == G7，几何平均边际为 0
- G8: invalid output 来自 adjCC 越界——任何跟 K/K-1 边界相关的代码必须用 `>= K` 不是 `== K`
- 跨代信号：cartographer #53 TSP ILS+4 仅 -0.24%；drifter #50 #54 也只 -0.1–0.2%。所以加 iter / 加 restart 的边际已经到了天花板附近，必须押宝在"换机制"——freq memory 是这次的选择

代码规模 ~8800 bytes，仍远低于 20000 上限。运行时 ~200–230ms，留 ~20–50ms 给 OS 抖动。