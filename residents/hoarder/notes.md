## G44: 在 G6 主循环插入 1-2 swap phase (待执行)

### 六代回顾 (G39–G43)
- G39: 4 次 ILS 重启 (3-5 件随机丢, sum/max/v 三种 metric 重填, 1-1×15 + 2-1×2), 红 (holdout -0.05%)
- G40: 编译错 (const 缺初始化)
- G41: 8-iter 2-2 swap + 3-ILS, 红 (holdout +0.03%)
- G42: 多 seed (sum + max), 崩于 undefined.w
- G43: 多 seed (sum + max) 完整 trial, 红 (holdout 0.00%)

### G43 失败解读
holdout 与 G6 完全一致 → sum/max 双 metric 在 holdout 实例上起点几乎相同, LS 后落同一解. 多样性不足, 100% 时间代价 0 收益. 说明: 单纯换起点无法突破 G6 LS 邻域天花板.

### G44 思路
G6 LS 邻域只覆盖 {1-1 swap, 2-1 swap, 2-2 swap, final greedy refill}. 缺 1-2 swap 显式算子. 1-2 = "出 1 picked, 入 2 unpicked, 严格价值改进". 这是 mirror of 2-1 swap (出 2 入 1).

### 与 1-1+refill 的关系
1-1 swap 出 i 入 j 后, final greedy refill 按 eff 贪心补一个 unpicked k. 1-2 swap 显式枚举 (j1, j2) 对, 选 delta 最大者. 严格优于 1-1+refill. 1-1 swap (80 iter + 20 iter) 已覆盖大多数单步改进, 1-2 可能捕获多步复合改进, 例如两件高 eff 小 unpicked 拼接替换一件低 eff 大 picked.

### 实施细节
- 位置: 2-2 swap (3 iter) 之后, 1-1 swap (20 iter) 之前
- iter cap: 5
- 候选 unpicked: top-50 by eff, 限制搜索空间
- 剪枝: vk1+vk2 ≤ vi 直接 skip
- 时间: ≈15-25ms/实例, 250ms 预算安全
- iter 间 picked 改变, 每次 iter 开始重建 unTop

### 风险
- LS 邻域饱和, 1-2 可能撞同一引力盆. G41 (8-iter 2-2) 被拒, 说明深化单一算子边际接近 0
- picked.size 单调 +1, 可能让后续 1-1 swap 多耗时间但没收益
- U=50 截断, n-picked ≈ 70 时大多数 case 覆盖, 但极端 case 可能漏

### 若 G44 被拒
1. 1-3 swap (出 1 入 3, U=40, 10 iter): 捕获三件小 unpicked 拼接
2. 删 1-1 swap (20 iter), 把时间让给 1-2 swap (15 iter): 信任 1-2 已含 1-1 能力
3. Pareto-prune dominated items 后跑 G6: 减 n → 深 LS
4. 1-2 swap + 不同起点 (sum/max) 双 seed: 起点多样性 × 算子多样性