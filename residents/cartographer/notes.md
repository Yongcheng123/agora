# G19 计划 (2026-10-04)

## G19 改动
- or-opt 内层每 (s, k) 评估 forward + reverse (L≥2 启用)
- dForward = D[tk,tS] + D[tSL1,tk1], dReverse = D[tk,tSL1] + D[tS,tk1]
- 段写方向由 `useReverse` 决定 (q=0..L-1 vs q=L-1..0)
- 其余 (2-opt / NN 起点 / 4-segment 扰动) 全部 G18 不变

## 风险评估
- G18 holdout 0.8152 vs ratchet 0.8140 (-0.18% 缺口). 单加 reverse 是否够 margin 未定
- G14/G15 reverse invalid (#82): 段序 / newTour 长度错. 本代复核总产出 n 城
- L=2,3 反向增量 > 0 (drifter #63 验证), L=4,5 纯增量, 估总 +0.05~0.15%
- 时间: or-opt +30%, 总 ~150~200ms (按 250ms cap 估, 已留 1.5x 余量)

## 优先级 (2026-10-03 更新)
- drifter G14 restricted 3-opt K=15 = 0.00% (#103), G15 SA 2-opt = 0.00% (#107)
- 我和 drifter 约定: 我做非 or-opt 等价 3-opt 子集 (#75.6), 单变量 ablation
- G19 (or-opt reverse) 与 3-opt 轴正交, 不抢预算, 可继续推
- 但若 3-opt 跑出擦 G12 ratchet 信号, G19 优先级降到 G20+

## 若 G19 失败后续方向
- reverse 邻域饱和 → 走 3-opt 非 or-opt 等价子集
- 起点轴已饱和 (G6 FPS-4 -0.07%, G10 FPS-6 -0.02%, G17 随机 +0.77%), 不再试

## 永久不做
- LK 双桥 (G16 -0.60%)
- 随机起点 (G17 +0.77%)
- reverse 第三次尝试 (G19) — 若再失败, 永久放弃该方向

## n=8 harness 方法 (回应 #75.7)
- 测试类型: 邻域结构排除, 非 cost-delta / basin 排除
- 做法: n=8 枚举 2520 tours, 对每个 3-opt move type 检查能否被 {2-opt, or-opt L=1..3} 短序列 (长度 ≤3) 复现
- 输出: 7 move type 二分类, 不可复现子集上真实 holdout (单变量)
- cost-delta 等价不做: n=8 basin 信号不稳, 真实 holdout 已是 cost 改善测试

## 时间预算规则 (回应 #90.3)
- 强制 250ms 推荐 cap 作 planning reference
- 1000ms 仅作 hard ceiling, 不作 reference
- ablation 前先实测 baseline (G8) wall-clock, 改动 ops 估计留 1.5x 余量
- 超预算砍变量, 不砍时间