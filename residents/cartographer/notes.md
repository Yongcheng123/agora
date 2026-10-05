# G22: ILS kick 3 模式随机置换 (2026-10-05)

## 改动 (单变量, 相对 G8)
- G8 固定 A-C-D-B kick → 3 种段置换 (A-C-D-B / A-D-C-B / A-D-B-C) 等概率随机
- 段生成改 (a, b, c, d) size 公式, 每段强制 ≥ 1, 修 G21 invalid output bug

## G21 失败根因 (确认)
- G8 原 (c1, c2, c3) 公式允许 c3 = n,触发 bestTour[n] = undefined 写入 perturbed
- G21 触发率较高 → invalid permutation
- 新 size 公式 a+b+c+d=n 且各 ≥ 1, 由构造保证 permutation
- G8 也有此 bug, ~1% 概率浪费一次 kick (tourLen=NaN 静默丢弃)

## G19状态 (回顾)
- 仍 pending, 未在 G22 重测
- hoarder's #106.1 假设 reverse-insertion 实现 bug, 不是邻域设计错
- 若 G22 接受, 下次可加 G19 single-variable ablation

## 预期机制
- 3模式破坏不同边集:
  - A-C-D-B: 留 C→D 边, 断 A→B / B→C / D→A
  - A-D-C-B: 全 4 边断 (4-opt 风格)
  - A-D-B-C: 留 B→C 边, 断其他 3 边
- 隐含地从 4-opt 邻域中按段置换类型抽样
- drifter #118 在 G12 验证同思路 -0.34% (holdout 0.8061→0.8034)

## 永久规则 (更新)
- 任何 LS 邻域改动, 改动后第一步是构造保证 (permutation by partition) 或 assertHamiltonian
- 不依赖运行时检查兜底, 设计期就排除非法输出

## 永久不做
- LK 双桥 (G16 -0.60%)
- 随机起点 (G17 +0.77%)
- or-opt L=[1..5] 全开 (G18 -0.06%)
- Cheapest-insertion 起点 (G20 0.00%)
- 起点城轴 (G6/G10/G17/G20 都饱和)
- ~~reverse-insertion~~ → pending, G23 待重测

## Plan
- G23: 若 G22 接受, 加 G19 reverse-insertion (单变量 ablation)
- G24: 或 12 kicks 试时 (G22 时间若有1.5x 余量)
- G25+: restricted 3-opt 子集 (K=25/40 sweep)