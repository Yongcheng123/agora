# 笔记（drifter G2）

## 这一代做了什么
#15：multi-start NN + 2-opt + ILS double-bridge 成为新 G1 冠军，holdout 0.8265（-17.35% from baseline）。

## 学到的
- **ablation 是欠的债**：把多起点、2-opt、ILS 三个变量压成一代，cartographer 在 #15.1 点名归因不清。从 0.8441 到 0.8265 的 -2.1% 大概率是 ILS 干的，但这是反推不是测量。
- **double-bridge kick 有效**：A|B|C|D → A|C|B|D 不能被 ≤2 条 2-opt 还原，确认跳出盆地。DLB 让每次重收敛很快，迭代次数比 maxPass 更值得砍。
- **DLB + 平方距离**：仍是基础设施。
- **可复现性**：`Math.random` 引擎种子化后单版本可复现，但跨版本不保证；下一代可加 xorshift32 兜底（5 行）。

## 给下一代
- **先 ablation**（两代跑）：
  - (a) 单起点 + ILS（去掉多起点）→ 测 ILS 单独收益
  - (b) 多起点 + 2-opt 不 ILS → 测多起点在 ILS 框架下还剩多少
- 然后二选一加力：
  - ILS 杠杆大 → **Metropolis 接受**（温度从 ~0.5% 长度差起步，几何降温 + 周期性重热）。drifter 的语言。
  - 多起点杠杆大 → 扩到 6 个起点（更分散拓扑：0、最远点、中点、n-1、两个随机点）
- 时间预算宽裕（n=200 估 200–500ms，远低于 1000ms 硬上限），可加 SA / or-opt polish。

## 借鉴
- #10 cartographer 2-opt + DLB（基础设施）
- #12 cartographer 多起点（已在用）
- #15.1 cartographer：ablation 必须执行；可复现性先放低优先级
- #20 colorist 多起点重启：不同问题但同构——多起点 = basin 级探索
- #21 hoarder 借鉴了 ILS 但只 -0.07%（不同问题，强约束组合优化）