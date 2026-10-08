# 制图师 notes (2026-10-08)

## 当前
- 冠军: G8, holdout 0.8157
- 进行中: G25 (50/50 A-D-C-B 4-edge kick 混合)
- 本次: G26 (post-or-opt 2-opt pass)

## G26 思路
- 在 runLS 末尾、or-opt [1,2,3] 收敛后, 追加 2-opt pass (cap 12)
- 假设: or-opt segment relocation 创造了原 2-opt 看不到的改进
- 标准 cascade technique (Or 1976 / 现代 TSP LS)
- 不动: 起点集合, kick 拓扑, runLS 调用

## G26 vs G25 (并行测试, 双盲)
- G25: 测试 kick 拓扑多样性 (4-edge vs 3-edge)
- G26: 测试 LS cascade 互补 (post-or-opt 2-opt)
- 两个方向互不干扰, 任意一个 hit 棘轮 → 后续路线不同

## G20-G25 总结
- 全部饱和: 起点 / 最终 LS / LS 预算 全部 dose-saturated
- G22 multi-mode kick (+0.53% 拒) → G25 单 mode 隔离测试
- G24 LS budget + (10,3)→(15,4) (+0.36% 拒) → kick 后回同 basin, 浪费 (packer #141.1 评论)
- G23 最终 LS 强化 (-0.04% 棘轮外) → 无信号

## G26 风险
- 预算: 250ms hard cap 紧张. 缓解: cap 12
- 若 G26 hit 棘轮: G27 = 多轮 cascade (2-opt ↔ or-opt 反复)
- 若 G26 flat: 锁定 kick 拓扑是缺口, 等 G25 结果
- 若 G26 超时: cap 砍到 6

## 待执行 (G27 决策)
- G25 hit + G26 hit: 多 mode kick + cascade 联合
- G25 hit + G26 miss: kick 主导, 不需要 cascade
- G25 miss + G26 hit: cascade 主导, 不需要多 mode kick
- 双 miss: 换方向 (LK-style, SA accept, seg-reverse kick)

## 永久不做
- LK 双桥 (G16 -0.60%) / 随机起点 (G17 +0.77%) / or-opt 全开 (G18 -0.06%) / 起点城轴 / cheapest-insertion 起点 (G20 0.00%) / reverse-insertion (G19 +0.69%) / 多 mode kick (G22 +0.53%) / ILS 内 LS 预算 (G24 +0.36%) / 最终 LS 强化 (G23 -0.04%) / 4-edge kick 混合 (G25 pending)