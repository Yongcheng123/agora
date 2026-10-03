# G18 notes

## 改动 (相对 G6)
在 1-1×20 与 final greedy 之间插入 "1-1 + 贪心填充前瞻" 阶段 × 5 iters.

每 iter:
- 预排序 unpicked by eff
- 对每个 (i ∈ picked, k ∈ unpicked, k ≠ i):
  - swap fit check
  - 模拟 swap + greedy fill 剩余容量
  - totalDelta = (vk - vi) + fillGain
  - 选 max totalDelta
- 若 bestDelta > 0, 应用 swap + fill

## 设计动机
G6 1-1 严格 `vk > vi` 接受, 拒绝所有 value-negative 1-1. 但 "1-1 swap (值负) + chain fill (值正)" 是新方向, G6 完全看不到. 2-1 也不考虑 fill, 只看 vLoss vs vk.

关键 insight: 5D 多维背包里, 1-1 swap 释放的容量常是"碎片化"的 (某些 dim 多, 某些 dim 少), greedy fill 可能装进 1-2 个小 unpicked, 整体 delta > 0.

## 风险
- 5D 分布下 fill 触发率未知, 可能很低
- G6 已饱和, 改善空间小
- 严格 bestDelta > 0 保证不退步

## 跨代对比 (G13-G17 都卡在 0.9827-0.9833, 棘轮 0.9814)
- G13 多 metric greedy 并行: 0.9829
- G14 ILS K=3-5: 0.9829
- G15 ILS K=6-10: 0.9832
- G16 3-for-2 swap: 0.9833
- G17 3-for-2 ×2: 0.9833
- G18 1-1+fill: ?

我的所有尝试都围绕 "邻域扩展" 和 "扰动", 都没触及 G6 1-1 严格 `vk > vi` 的核心限制. G18 是首次直接打破这个限制.

## G19 方向
- 若 G18 通过 (~-0.05%): 2-1+fill (top 5 pairs × top 10 k, fill 全), 1-2+fill (受限)
- 若 G18 失败:
  - LP 松弛 + LS (5 维 120 item LP 可解, 整数化 + LS)
  - 多起点 greedy (G13 已试独立选, 试 metric 组合)
  - Path relink (借鉴 cartographer)
  - 1-1+fill with multi-step lookahead (2-3 步)

## 关键不确定性
- fill 触发率: 多大比例 swap 后能 fill ≥ 1 个 unpicked?
- 链式提升需要多轮, 5 iters 够不够?
- 5D weight 分布下, 1-1 swap 释放的容量是否常常"形状匹配"小 unpicked?

## 时间预算
- G6 主体: ~100-150ms (估, 实际 1-1×80 大部分早 break)
- G18 新增: ~50-80ms
- 总: ~150-230ms, 250ms 预算内 (有 20-100ms 余量)