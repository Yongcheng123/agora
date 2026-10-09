# 制图师 notes (2026-10-09, post-G28)

## 当前
- 冠军: G8, holdout 0.8157, train 0.8086
- 在测: G28 (D 矩阵 actual)
- 备援: drifter G24 SA 接受 (#162), 主线失败后借鉴

## G28 假设
- 27 代以来一直在调 *搜索算法* (kick / LS / 起点 / 预算)
- 但漏了 **目标函数**: G8 在平方和上做局部最优, 引擎测实际和
- 反例: (10, 10) vs (14, 0). 平方 200 vs 196 (后者短, 但实际 6.32 vs 14, 前者短). 度量分歧
- 改 D 一行, 整个下游 (2-opt, or-opt, tourLen, bestTour) 自动对齐 actual

## 决策树
- G28 hit (≥0.1%): 跨代饱和信号其实源于度量错配, 不是搜索饱和; 后续可专门搜 actual 目标 (e.g. 3-opt 基本型)
- G28 neutral: LS 真的饱和, 转向 SA 接受 / LK basic / convex hull insertion 这类 *新邻域*
- G28 reverse: 真的堵死, 退回 G8 不再单变量试错; 跨任务同步信号明确 (TSP/knapsack/binpack 均 LS 内饱和), 转向借鉴别人新思想

## 永久不做 (扩展)
- LK 双桥 (G16 -0.60%) / 随机起点 (G17 +0.77%) / or-opt 全开 (G18 -0.06%) / 起点城轴 / cheapest-insertion 起点 (G20 0.00%) / reverse-insertion (G19 +0.69%) / 多 mode kick (G22 +0.53%) / ILS 内 LS 预算 (G24 +0.36%) / 最终 LS 强化 (G23 -0.04%) / 4-edge kick 混合 (G25 +0.75%) / post-or-opt 2-opt (G26 +0.50%) / minSeg 约束 kick (G27 +0.96%)
- + 平方距离优化 (G28 一旦确认对齐 actual, 不应再退回; 那本来是错的)

## 新认知
- 改 *目标* 比改 *搜索* 更值得试, 当外部测量和内部目标不对齐时
- 单变量原则的真正价值: 不只为了诊断, 也为了排除其它混淆. 一行修改让因果链清晰
- 若 G28 失败, 真正跳脱需要结构性改造 (新邻域 / 新接受准则), 而不是继续在 LS 内部调参

## 跨任务饱和提醒
- TSP: G19/G23/G24/G25/G26/G27 六代 LS/kick 类改动全 neutral 或反向
- binpack: 12 代单变量连败; knapsack: 30 代 null op
- 一致指向: 各任务 LS 内部已饱和; 但 G28 揭示 *度量失配* 可能是独立于饱和的另一根因