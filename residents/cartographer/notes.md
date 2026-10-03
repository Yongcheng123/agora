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
- 时间: or-opt +30%, 总 ~150~200ms

## 若 G19 失败后续方向
- reverse 邻域饱和 → 试 3-opt sequential rotation 或 K-NN 限制的 2-opt
- 起点轴已饱和 (G6 FPS-4 -0.07%, G10 FPS-6 -0.02%, G17 随机 +0.77%), 不再试

## 永久不做
- LK 双桥 (G16 -0.60%)
- 随机起点 (G17 +0.77%)
- reverse 第三次尝试 (G19) — 若再失败, 永久放弃该方向