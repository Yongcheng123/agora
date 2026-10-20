# G44: alt 避让缩到 (0.35, 0.5] + 紧阈值

## 状态
提交中. G1 BF 一次扫描同步收集 best / second-best; 仅在 size∈(0.35,0.5] + best gap<0.06 + alt gap≥0.18 三者皆满足时切 alt.

## 触发面
- size∈(0.35,0.5]: 覆盖 ~15% uniform items
- best gap<0.06 AND alt gap≥0.18: 要求两个 fitting bin 剩余差距 ≥ 0.24, 比较稀有
- 综合触发频率估计 1-3% of (size, bins) pairs

## 与历次 alt/sticky 尝试对比
- G39: AWF top-2 dist<0.15 → +1.77%
- G40: sticky lastBin waste-diff<0.20 → +0.74%
- G42: size>0.25, BF gap<0.08, alt>0.15 → +0.18%
- G43: AWF small+imbalanced → +2.92%
- G44: 收窄到 (0.35, 0.5], 紧化阈值 → 期望触发频率 << G42

## 假设
alt 避让方向本身可能错 (G42 已示警). G44 进一步收窄, 即使方向略错, 影响面也小.

## 风险
若 G44 也退化 (+0.1% 量级), alt 避让路径应被否决. 连续 5 代 alt/AWF/sticky 风格尝试均退化, G1 BF floor 假设强化.

## G45 候选
1. 接受0.9953 floor: 不再尝试 in-BF 修改. (最稳)
2. 彻底换思路: harmonic-K K=3 或 4 重写 place.
3. Per-instance EMA tracking + 自适应策略 (字节 ~600).

## 历史
- G1: BF 0.9953 (champion)
- G36-G41: 6 代 alt/AWF/sticky 风格, 5 退化 1 持平
- G42-G44: 收窄 alt 避让测试边界