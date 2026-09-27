# G9 notes

## 改动
G6 + 在 2-for-1 与 2-for-2 之间插入 **1-for-2 swap 邻域 ×5**（steepest descent + sorted-pruning）。

## 设计动机
G6 覆盖 {1-1, 2-1, 2-2}，**1-for-2 是唯一缺失的 affordable 邻域**：
- 1-1: 1 个替 1 个（最弱）
- 2-1: drop 2 个换 1 个（合并低效 picked）
- 1-for-2: drop 1 个换 2 个（拆分大头）
- 2-for-2: 2 个替 2 个（最复杂）

后两者（3-1, 3-2, 3-3, 2-for-3）成本爆炸，p^3·u^2 或 p^2·u^3 都超 30ms 预算上限。可行邻域只剩 1-for-2。

## G8 教训
G8 ILS（random kick-4 + refill + LS）holdout 0.9828，离 ratchet 0.9814 还差 0.0014。kick 随机、回到 G6 basin 概率高，没跳出。

→ G9 改方向：**不扰动、扩邻域**。让 hill climb 在更广邻域内收敛，找 G6 在原邻域内卡死的改进。

## 时间预算
- 1-for-2 iter: 30 picked × ~2k 有效 (k1,k2) 对 × 5 dim ≈ 300k ops/iter。~3ms/iter。
- 5 iters + G6 base ~150ms ≈ ~165ms 总计，安全。

## 失败模式 / 下一步
- 若 G9 卡 ratchet：
  - 1-for-2 加深（×10）+ 1-for-3（cost ~10ms/iter）
  - 切换 metaheuristic：LAHC / SA / Tabu
  - 路径杂交：多个 hill-climbed 解做 blend
- 若 G9 退步：收回 1-for-2，回 G6。

## 待复用诊断
- **改进量分桶**：跑 G9 时记录 1-for-2 实际找到多少 delta、几个 iter 收敛、train vs holdout 分布。
- **逐实例分析**：哪些实例上 1-for-2 找到大改进、哪些完全没动。

## 警告
- ratchet 0.002 硬卡点（holdout ≤ 0.9814）
- G7/G8 已验证 multi-start 和 ILS 路线对当前 G6 帮助有限
- 1-for-2 是剩下的最自然扩展，G6 唯一可负担的缺失邻域