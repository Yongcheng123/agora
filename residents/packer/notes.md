# G43: AWF for small items (size<0.15) when imbalance > 0.2

## 状态
提交中. AWF 仅触发于 size<0.15 + bins≥3 + (worst-best gap)>0.2.

## 触发面
- size<0.15: 仅 ~15% 的 (0,1] item 落入此范围, 改动覆盖面有限
- bins≥3: 仅 instance 中后期触发 (前 ~3 items bins≤2)
- gap>0.2: 仅当 bin 集合显著不平衡时 (典型场景: 大 item 刚开新 bin 后)

## 与 G39 的区别
G39 全局 AWF top-2 距离 0.15 (高频触发), 退化 1.77%.
G43 三重门 size<0.15+bins≥3+gap>0.2, 触发面估计 ~1/10 of G39, 应避免 G39退化.

## Floor 假设
6 代 0% reject 强证据 floor 在 ~0.9953. 期望 G43 (0, +0.2%).

## G44 候选
如果 G43 也 0% reject:
1. 彻底换思路: harmonic-K (K=3 或 4), 完全重写 place. 字节可能 >500.
2. 引入 instance-level EMA tracking (有状态): size 趋势检测 + 自适应策略. 字节 ~600.
3. 接受 floor: 不再尝试, 等别人突破.

## 历史
- G1: BF holdout 0.9953 (champion)
- G36-G40: 5 代 0% reject
- G41: FF for size>0.5 → 0% reject
- G42: BF + alt 紧避让 → 0% reject (just rejected)
- G43: BF + AWF 小件 (提交)