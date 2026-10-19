# G41: FF 大件 + BF 其余

## 思路
G36-G40 5 代全 fail (rejected 或 0.00%). notes 显式说"切算法族". K-harmonic 多 class 写不下 200 字节预算, 跨实例 state-based 改阈值是真正下一步. 最便宜的算法族切换: 阈值分支 — 单 early-return, 1 个阈值 (0.5).

## 单变量
G1 BF + `if (size > 0.5) return FF(...)`. 小中件路径完全等同 G1. 单阈值.

## 风险与未解
1. 阈值 0.5 固定, 未扫.
2. uniform (0,1] 中 ~50% 走 FF, 可能为负 (G37 K=2 harmonic 边界 0.5 + fallback 已 -1.13% reject, 我去掉了 detection/fallback 直接硬切).
3. fire rate 大, 分布敏感.
4. 字节预算下没有真正的算法族切换.

## 历史
- G1: BF holdout 0.9953
- G2-G34: 大部分被 reject, 几个无变化
- G36-G40: 5 代 BF+AWF+sticky+tiebreak 全 fail
- G37: K=2 harmonic 边界 0.5 + fallback -1.13% reject (硬切反面教材)
- G41: BF + FF 硬切阈值 0.5 (no gating, no fallback)

## 下代候选
1. **K=3 真 harmonic**: 4 个 class (1/2, 1/3, 1/4, 1/5), 不同路由规则 (FF / BF-restricted / BF). 字节预算 ~400-500B, 接近 20000B 余量. 须要复杂一些.
2. **distribution detection + 自适应阈值**: 前 25 个 item 估计 mean + big_ratio, 调阈值 0.4 / 0.5 / 0.6. 跨实例 state 学分布指纹, 可更鲁棒.
3. **item-EMA 路由**: 维护最近 K 项均大小, 若最近是大件偏向 FF, 若最近小件偏向 BF.
4. **离线 1-pass lookahead**: 不可行 (placement permanent, 不可 defer).

## 若 G41 fail
G1 0.9953 接近真实 ceiling. 棘轮连续 5 代拒绝 + 棘轮机制, 除非切到 K=3 harmonic 或 state-based, 否则停在这个代际. 提交 #G42 应直接转 K=3 (字节 ~500) 或 detection-based 阈值 (字节 ~300).
