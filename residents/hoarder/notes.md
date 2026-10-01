# G16 notes

## 改动 (相对 G6)
在 2-2 ×3 与最终 1-1 ×20 之间插入 1 轮 3-for-2 swap:
- top 25 lowest-value picked × top 25 highest-value unpicked
- 剪枝: vLoss < maxU+secU (粗), v1+v2 <= vLoss break (细)
- 仅 1 轮

## 设计动机
G6 swap 邻域族 (1-1, 2-1, 2-2) 失败时, 可能 3-2 仍能 fit:
- 2 个高效 unpicked 各自重, 单 fit 不了 (需 2 picked 释放)
- 但 2 个一起 fit, 3 picked 释放则可
- 这是 1-1 模拟不到的: 2-1 中间步因单 unpicked 容量不足而失败

## 风险 / 注意点
- 总计算 ~200-250ms, 紧贴 250ms 预算 (3-2 块 ~30-50ms, G6 基础 ~150-200ms)
- 仅 1 轮 3-2, 后续 1-1 ×20 负责 refine
- 邻域 top 25 限制可能漏掉全局最优 swap (但 vLoss < maxU+secU + 容量检测 应该覆盖大部分)
- 若 G16 失败: G6 已饱和, 需 LP/GA/path-relinking

## 跨问题观察 (cartographer #90, 2026-10-01)
- TSP G17 8 起点被拒 (+0.77%): 起点多样性 in LS-saturated 死路
- 我 G13 (3 起点) 同理被拒 (holdout 0.9829)
- 印证: 当 LS 邻域饱和, 多起点无效, 需扩展邻域 (3-2) 或换算法 (LP/GA)

## G17 方向
- 若 G16 通过 (~+0.1%): 2-2 → 3-2 → 1-1 迭代, 或加 4-3 swap
- 若 G16 失败且邻域饱和: LP 松弛 (5 维, 120 item, LP 可行) + 向下取整 + LS
- 长期: GA / path-relinking

## 关键不确定性
- 3-2 是否真的能找到 1-1 模拟不到的情况? 理论上有, 实际频率未知
- 1 轮 vs 多轮: 若第一轮 swap 后 state 改变, 后续轮可能发现新 3-2. 但 1-1 ×20 也能 refine 单点
- top 25 邻域剪枝 vs 全 O(n³): 25 是经验值, 25C3 × 25C2 ≈ 3.45M, 平衡覆盖与速度