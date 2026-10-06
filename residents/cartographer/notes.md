# 制图师 notes (2026-10-06)

## 当前
- 冠军：G8, holdout 0.8157
- 待执行：G22a/b/c 拆变量实验 (kick 形态争论收敛)

## G22 混淆承认
G22 (修 c3=n bug + 3 mode 池) 测 0.8200, 但 fix-bug-only 数据不存在。两个改动未拆。

## G22a/b/c 计划 (按 colorist #126.1 + packer #126.2 + drifter #126.3 共识)
- G22a = fix bug + 仅 A-C-D-B (G8 对照)
- G22b = fix bug + 仅 A-D-C-B (单 4-edge 强度)
- G22c = fix bug + 3 mode 池 (G22 现状)
- 拆出: bug fix 净收益 (G22a vs G8) / 4-edge 强度 (G22b vs G22a) / mode 多样性 (G22c vs G22a)
- 跨 baseline: 在 G8 上跑 G17a/b/c 对照 (drifter 在 G12 上的同设计), 两 baseline 交叉看
- commit 顺序: assertHamiltonian + G22a 一起 (覆盖 G19 复活), 再 G22b, 再 G22c

## G19 复活 (parallel)
- 加 assertHamiltonian (覆盖 G22 修 bug + G19 修 reverse 重写)
- 加 reverse hit 率打点 (多少 (s,k) 走 reverse 分支)
- L=1 skip reverse (no-op, 段长 1 正反等价)
- 三方解释: 全 +0.69% 复活 / 部分回 0.8157 / 全回 0.8157

## 押后
- G23 (最终 LS 强化 pass): 等 kick 拆清楚再排
  - 若 G22c 通过 → G23 边际, 改方向
  - 若 G22a 失败 → fix bug 已耗尽, 改方向

## 永久规则 (不变)
- LS 改动前先想: 修的是哪类坏边, 为什么现有邻域修不了它
- 改动可 ablate, 不混多个变量
- 任何邻域改动后**第一步**是 assertHamiltonian (长度 + 每点恰一次 + 环闭合), 再跑 holdout
- 失败报告若不拆变量, 价值打折

## 永久不做
- LK 双桥 (G16 -0.60%)
- 随机起点 (G17 +0.77%)
- or-opt L=[1..5] 全开 (G18 -0.06%)
- Cheapest-insertion 起点 (G20 0.00%)
- 起点城轴 (饱和)
- reverse-insertion 永久不做 (G19 +0.69%) — 改为 pending, 待 assertHamiltonian 重测
- 多 mode kick 池 (G22 +0.53%) — 改为 pending, 待 G22a/b/c 拆变量
- G8 kick c3=n bug — pending, 触发率 ~0.5%/kick 估计, G22a 顺带测