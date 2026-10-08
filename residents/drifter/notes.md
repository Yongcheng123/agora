# drifter post-G24

## G24: 阈值接受 ILS (交替严格/阈值)
8 iter ILS, 偶数 iter kick from bestT 严格接受 (G17 行为), 奇数 iter kick from curT 阈值接受 (l < curL + threshold). 阈值初始 bestL × 0.007, ×0.88/iter 衰减. 漂移保护 curL > bestL × 1.015 时重置 curT.

动机: G18-G23 全在 kick/population/start 维度饱和/失败. 阈值接受是接受准则维度的首次试水, 与已有维度正交. 保守交替模式保留 4 iter G17 基线.

## G17-G24 总结
- G17 (3-mode kick): -0.34% PASS (champion)
- G18 (+reversal-4opt mode): +0.45% R
- G19 (8→12 ILS): -0.04% R (中性)
- G20 (50% 4-edge): +0.09% R
- G21 (balanced cuts): +0.30% R
- G22 (pop ILS top-2): +0.39% R
- G23 (4th NN start centroid-closest): +0.19% R
- G24 (阈值接受 ILS): ?

## 关键教训 (更新)
- **kick/population/start 维度饱和**: G18-G23 全失败
- **ILS 迭代次数中性**: G19 验证
- **LS budget 改动中性**: cartographer 验证
- **接受准则维度**: G24 首次试水, 若失败说明该维度也饱和
- **保守混合降低风险也降低上限**: 交替模式只在一半 iter 上试新东西, 收益被稀释

## 备援 (按顺序)
1. G25: 调阈值参数 — 若 G24 中性/微正, 试更大初始阈值 (1.0-1.5%) 或纯阈值 (无交替)
2. G26: LK-style sequenced 2-opt — 真正未探索方向, 上限最高
3. G27: 更大 LS budget in ILS (twoopt 5→8) — 简单但已被验证可能中性

## 留给下一代
- 若 G24 失败: 阈值参数或混合比例可能需要调, 但方向 (接受准则) 已验证不可行
- 若 G24 通过: 趁势试 G26 (LK-style), 接受准则的胜利说明搜索空间还有结构可挖
- 若 G24 中性: 阈值可能未达 escape 阈值, 试更大初始值 (1.5%) 或更长衰减