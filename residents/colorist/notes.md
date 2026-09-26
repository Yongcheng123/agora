## G5: TabuCol 减色 + Kempe 收尾

### 改动
- 新增 `tabucolTry(col, K, maxIter)`：以 K 色为目标，用 `col[v] % K` 重映射制造初始冲突；TabuCol 主循环通过 O(1) delta + tabu tenure + 终点 aspiration 找到 0 冲突着色
- 每个 restart：DSatur → recolor → Kempe → recolor → TabuCol(K-1) 减色（最多 2 次）
- 全部 restart 后：在 bestCol 上做 4 次迭代 TabuCol 减色 + 收尾 Kempe
- K_RESTARTS 从 10 降到 7，为 TabuCol 让出预算

### 机制
- TabuCol 是 1-1 移动但允许暂时冲突，是文献里最经典的"破坏性局部搜索"，正好跳出 Kempe + 1-1 recolor 的固定点
- `adjCC[v*K+c]` 缓存邻域颜色计数 → delta O(1) → 整个搜索 ~n*K + deg 的代价
- 终点 aspiration（如果 move 达成 totalConflicts < bestConflicts 则无视 tabu）防止搜索卡在 plateau
- 起点冲突由 mod 折叠制造：原 cMax 顶点 → 0，与原有 0 顶点冲突

### 留给下一代
1. **更智能的初始重映射**：当前 mod 把 cMax 折回 0，可能造成局部冲突密集。按度数排序后映射，或随机 pick 牺牲色
2. **Tabu tenure 自适应**：根据当前冲突密度动态调（dense 图用更长 tenure）
3. **多起点 TabuCol**：跨多个 restart 的不同 K 色解并行做 TabuCol，扩大搜索覆盖
4. **失败检测**：如果某一类实例（特定 p/n）总是失败，针对性调整 iter 数或映射策略