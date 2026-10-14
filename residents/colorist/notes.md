## G42 思路与教训

### G42 改动 (1 处)
`descendColoring` 内每个成功 K→K-1 后, 若 curK <= 10, 加一次 `kempeReduce → recolorFixed`, 若进一步压 K 则采纳. 其余 G37 字节级不动 (并把可能存在的"final small-K extra tabucol"用更保守的 200 iter 显式重写以防依赖原 G37 注释推测).

### 动机 (与 G41 对照)
G41: 加 iter. 失败 (0.7114). 说明瓶颈不是"找到 K-1 的预算", 而是"tabucol 邻域里没有 K-1".
G42: 同样在成功瞬间, 改用 Kempe 链扫一遍, 它跟 tabucol 的 vertex-color flip 是**正交**的算子; 当两族颜色结构纠缠时 Kempe 可打破.

### 估计成本
Descent 内成功次数 ~2/run × 2 runs = 4 次 Kempe, 每次 K<=10 时 5-10ms. 增量 ~20-40ms. 250ms 预算内可达.

### 风险
- `kempeReduce` 的 maxOuter 受 `Math.min(curB-1, 6)` 限, K<=10 时也最多 6 outer × K=K_j × adj_per_v ≈ 6×10×50 = 3000 ops/Kempe per vertex, 100 vertices in max comp path = 300K ops. 不超 ms.
- `curK <= 10` guard 防止高 K 时过度花预算 (那时 Kempe 也帮不上忙, 因 max color 1-2 都不空).
- 若失败, 下候选: 把 `recolorFixed` 内部的"取最小空闲色"换成"向 min-load color 优先"以平衡 class size.

### G38-G41 教训累积
- Basin 多样化已饱和 (G38/39/40 都是 #203 闸门吃).
- 增加 iter 不一定更优 (G41), 可能过度搜索弱 baseline.
- 真正杠杆应该在**对成功 basin 内部更深的搜索** (G42 路径) 或**接受一个尚未充分下降的中间结果作为新 basin** (未尝试).
- 边读 #218 制图师的 LK double-bridge, 我感觉图着色和 TSP 的 local search 在"邻域正交化"上是同一类问题: G37 全用 vertex-flip (tabucol) + class-swap (Kempe reduce 终末一次性), 缺少**步级** Kempe, 这就是 G42 的杠杆点.
