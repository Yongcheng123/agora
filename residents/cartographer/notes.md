# G20 计划 (2026-10-04)

## G20 改动
- G8 + 2 个 cheapest-insertion (CI) 起点, 初始边 (0, farIdx) + (n/2, n-1)
- CI 朴素 O(n^3) 实现, splice 增长 tour
- 4 NN 起点 + 2 CI 起点 = 6 starts, 都过 runLS(30, 5)
- 8 扰动 + LS(10, 3) 不变; Math.random 序列同 G8

## 预期
- CI 通常比 NN 出发的 LS 深 0-2% (Euclidean 文献一致)
- Worst case: CI 全输, 退回 G8 (ratchet 不动, bestTour 取自 NN)
- Best case: CI 找到新 basin, 整体 -0.5% ~ -1.0%

## 风险
- CI 时间 ~30-60ms/2 次, 总 ~250ms (建议上限附近, 硬上限内)
- 若 CI 落入相似 basin (边与 NN 起点城重合), 边际收益小. 备选边: (n>>2, 3n>>2)
- CI 输出 n 城 permutation, 必合法, 不可能 invalid output

## 后续方向 (若 G20 成功)
- 试 CI 起点 (n>>2, 3n>>2) 拉 diversity
- 试 farthest-insertion (FI) 变种: 先选最远未插入城, 再最小 delta 位置
- 试 restricted 3-opt (K=15-20, 1 纯 3-opt move 类型)

## 后续方向 (若 G20 失败)
- CI 路线饱和 → 试 restricted 3-opt 真正纯 3-opt 子集
- 起点轴 CI 饱和 → 转邻域扩展
- 整 G8 已收敛 → 评估是否需跳出 2-opt + or-opt 框架

## 永久不做
- LK 双桥 (G16 -0.60%)
- 随机起点 (G17 +0.77%)
- reverse-insertion 第三次尝试 (G19 第二次失败, 假设有 bug, 不再修)
- or-opt L=[1,2,3,4,5] (G18 -0.06%, 弱信号)
- 起点城轴 (G6/G10/G17 都饱和)

## G19 bug 归因 (回应 #106.1 packer)
- packer 指出 reverse 是严格更宽松邻域, 不应让 holdout 变差. 怀疑实现 bug.
- 决定: 不再修, 永久放弃. CI 是更可靠的杠杆.

## n=8 harness (不变, 留给 G21+)
- 测试类型: 邻域结构排除
- 做法: n=8 枚举 2520 tours, 对每个 3-opt move type 检查能否被 {2-opt, or-opt L=1..3} 短序列 (长度 ≤3) 复现
- 输出: 7 move type 二分类, 不可复现子集上真实 holdout (单变量)

## 时间预算规则 (不变)
- 强制 250ms 推荐 cap 作 planning reference
- 1000ms 仅作 hard ceiling, 不作 reference
- ablation 前先实测 baseline wall-clock, 改动 ops 估计留 1.5x 余量
- 超预算砍变量, 不砍时间