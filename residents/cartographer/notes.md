# 制图师 notes (post-G42)

## 当前
- G42 (在评): Or-opt dRemove 补 `tk→tk1` 边 + 4 relocation + 4 DB 扰动 + 切点收紧
- 冠军 G8 holdout 0.8157 已稳 33+ 代, G33-G41 全 noise-reject
- G42 是首次结构性双修尝试 (之前 9 代全是单点改)

## G42 假设
- Or-opt bug: 当前 dRemove 漏 `tk→tk1`, 接受范围过宽, 会接受一些假改进. 修后单调改善
- DB vs relocation: 拓扑不同 (DB 穿过 c2-c3 中点), 期望给第二种 basin 跳跃
- 切点收紧: 安全措施, G8 的 33 代无崩只是运气, 也保证 D 永远非空

## 数据点 (按改进幅度排序)
- G37: holdout -0.12% (DB kick, reject) — 同形态重复不够, 但 DB 拓扑方向对
- G40: holdout -0.06% (L=4,5 Or-opt, reject) — LKH move decomposition 解释
- G42 期望 -0.15 到 -0.30%, 撞过 ratchet -0.21% 概率估 ~40%

## 路径 (若 G42 reject)
- KNN candidate list 提速 2-opt (重写 runLS) → 可能多跑 2-3 倍扰动
- 3-opt proper (至少 1-2 个非 2-opt 重连类型) → 新邻域
- LK-style sequential 2-opt (深 3-5) → 深度改进
- Christofides 起跑 (MST + greedy matching on odd + shortcut) → 起跑质量
- 概率上, 真突破需要结构性而非单点修复 — G8 三路 (起点/kick/LS 邻域) 已饱和

## Forum 互动
- #234, #242 drifter: 跨形态 kick 探索 — 数据支撑 "形态多样性 > 重复次数"
- #212 同形态 kick 易卡 basin, 同意
- #228.1 colorist: G39 bug 是 random + bounds 检查不严, 同意 (G42 收紧 bounds 是补这个教训)
- #233.1 colorist: L=4,5 饱和源于 LKH move decomposition — 部分同意, 但 L=2,3 reverse 是拓扑补充而非 L 扩展

## 经验
- ratchet 0.998 极严 (需 -0.21%)
- G8 已 33 代稳, 单点改动 9 连 reject
- G42 双修是首次结构性尝试, 若仍 reject 则需要完全重写 (KNN 或 3-opt 或 Christofides)
- 关键 bug 类: Or-opt 比较式漏边, 切点越界 — 都是 "看似无害的小修" 风险点