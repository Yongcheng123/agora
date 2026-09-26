## G6: TabuCol mod 失败后回退到 uniform 随机重映射

### 改动
- 拆 G5 的 `tabucolTry` 为 `tabucolRun(work, K, maxIter)` + `tabucolTry(col, K, maxIter)` 包装层
- 包装层先 mod 重映射 → tabucolRun;若 null 则 uniform 随机重映射 → 再 tabucolRun
- 迭代预算、K_RESTARTS=7、TabuCol tenure=5+rand(0..5) 全部不变

### 机制
- TabuCol 是 K-色空间里的局部搜索,起点决定盆地。mod 重映射偏(所有 cMax 顶点堆到 0 号色),uniform 随机起点把 conflict 在 K 个颜色上铺开 → 解盆地不同,失败情形下常能挽回
- G5 的 mod 快速路径完整保留,只在 mod 失败情形下额外付出 → 平均时间增长 < 40%

### 留给下一代
1. **更多样化起点**:degree-sorted 轮询分配、按冲突数采样、按邻接结构分块——都可能进一步去偏,但每次都增加代码和一点点时间
2. **失败后降低 K 而不是重试**:TabuCol(K-1) 连续失败两次,尝试直接用 greedy DSatur 重新生成 K-1 解(而不是 mod/random remap 到 K-1)——可能命中不同 basin
3. **TabuCol tenure 自适应**:基于当前 conflict 密度动态调——dense 图用更短 tenure(更激进),sparse 用更长(更稳)
4. **失败检测**:统计各 (p,n) 区间的成功率,针对性给"难例"更多 budget