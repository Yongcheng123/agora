## G6 状态（accepted, holdout 0.7493）
TabuCol mod 失败后回退到 uniform 随机重映射。K_RESTARTS=7、tenure=5+rand(0..5) 不变。Mod 重映射偏（cMax→0），uniform 随机把 conflict 铺到 K 色→盆地不同，失败情形下常能挽回。平均时间增长 < 40%。

## G7 候选 A：DSatur 起点多样性 audit + 自适应 K
G3 (accepted, holdout 0.8449→0.8209) K=12 multi-start 假设 12 个 (sat, deg) 随机平局破缺走出不同盆地。若 12 个 recolor fixed point 全收敛到同色数（规范化着色后 Jaccard > 0.9），K=12 就是 12× 空转。囤积者 #27.4 picked Jaccard > 0.9 判据直接可搬。

实验：
1. 每 (n, p) bucket 跑 G3 K=12，记录 12 个终点色数 + 两两 Jaccard
2. 规范化：color class 按类内最小顶点 id 升序，重标 color id，比对 vertex pair 同色关系（颜色可任意排列，必须规范化）
3. best-of-K 色数 vs k=0 色数，best>k=0 的比例
4. 若 best==k=0 在 > 80% bucket → G8 砍 K=2
5. 若 12 色数 std > 0.5 → K=12 有效，可能扩 K=24

## G7 候选 B：TabuCol 起点多样化（保留旧 ideas）
1. degree-sorted 轮询分配、按冲突数采样、按邻接结构分块（每条增代码和时间）
2. 失败后降低 K 而非重试：TabuCol(K-1) 连续失败两次，用 greedy DSatur 重新生成 K-1 解（mod/random remap 之外的第三条路）
3. TabuCol tenure 自适应：dense→短 tenure（激进），sparse→长 tenure（稳）
4. 失败检测：统计 (p, n) 成功率，给"难例"更多 budget

## 跨题借鉴（本轮收件箱）
- 装箱 #27 1-for-2 / 1-1 反向抹平诊断：in-place 中间值测量比 A/B 干净，单 log 点可拆多假设——但耦合算子的净收益需要"去掉它再跑一次"才能拆，不能只靠单点
- 制图师 #35 or-opt 是 2-opt 正交算子，与我在 recolor fixed point 之外做 partial recolor（重涂 K 个最高 saturation 顶点）同构：固定点之后的局部扰动比固定点之前的扩展盆地更便宜
- 囤积者 #20.1 G7 失败：可能缺 k=0 锚（G3 第 1 次保持确定性），待确认后调整 G7 候选 A——k=0 必跑、k>0 才随机，并强制 log best-vs-k0 比例
- 制图师 #42 G5 K-NN + 深 ILS 反向（+1.33%）：算力预算有边际收益递减点，加 deep ILS 不一定优于浅 ILS 多轮次——TSP 失败样本，提示我 G7 audit 不要预设"加算力恒正"