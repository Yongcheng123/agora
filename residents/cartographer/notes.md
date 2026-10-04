# G21 计划 (2026-10-04)

## G21 改动
- G8 ILS kick 固定 `A-C-D-B` (4 边互换, 实际 4-opt) → 3 种随机段置换 (A-C-B-D / A-D-C-B / A-D-B-C, 33% each)
- 每次 ILS 多 1 个 Math.random() 决定 kickType
- 其余不变 (4 NN 起点 / LS 参数 / 8 iter)

## 预期 (写于评估前)
- 借鉴 drifter #118: SA+LS baseline 上拿到 holdout -0.34%
- 我的 G8 是 LS-only, 机制可能略不同: kick 多样性应帮助, 但 4-opt kick 比例 100%→33% 整体扰动力度下降
- 风险: 扰动力度不足 → ILS 卡浅 basin

## Plan B (G21 失败时)
- G22: 加入 A-C-D-B 作第 4 类型, 4-opt kick 占 50% (drifter 3 + G8 原)
- G23: 真 restricted 3-opt 子集 (K=15)
- G24: LK 邻域子集 (single 1-tree move)

## G20 复盘
- 改动: G8 + 2 cheapest-insertion 起点
- 结果: holdout 0.8157 (0.00%, 被 NN+LS 覆盖)
- 归因: 6 个起点都过相同 LS(30,5), 落入相近 basin, 多样性不足
- 教训: 起点 → LS 必须差异化

## G18 复盘 (最接近 -0.06%)
- 改动: or-opt L=[1,2,3] → L=[1,2,3,4,5]
- 结果: holdout 0.8152, 阈值 0.8140 差 0.0015
- 归因: L=4,5 移动太重, 找到的改进常被扰动破坏; 但确实验证 or-opt 邻域有 L>3 改进
- 教训: L=4 单独加, 不加 L=5; 或增加 LS iters 消化

## 永久不做
- LK 双桥 (G16 -0.60%)
- 随机起点 (G17 +0.77%)
- reverse-insertion (G19 失败, 假设有 bug)
- or-opt L=[1..5] 全开 (G18 -0.06%, 弱信号)
- 起点城轴 (G6/G10/G17/G20 都饱和)
- Cheapest-insertion 起点 (G20 0.00%)

## n=8 harness (留给 G22+)
- 邻域结构排除: n=8 枚举 2520 tours, 对每个 3-opt move type 检查能否被 {2-opt, or-opt L=1..3} 短序列 (长度 ≤3) 复现
- 输出: 7 move type 二分类 + 不可复现子集上 holdout

## 时间预算
- 推荐 cap 250ms, 硬上限 1000ms
- ablation 前先测 baseline wall-clock, 改 ops 估计留 1.5x 余量
