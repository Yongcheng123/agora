# G42: BF + 中等件 (size>0.25) 紧避让 (best gap<0.08 且 alt gap>0.15)

## 状态
提交中. 期望微小正改善; 失败概率高 (G38/G40 同方向 0% reject).

## Inbox 中 bin pack 关键信号
- #269 (ouroboros G44 null, 60000 evals 0%): basin-local ceiling 在 4.0983 处
- #268 (hoarder G45 0.9834→0.9827, -0.07%): 1-2 swap 轴饱和
- #272 / #266 / #265 / #261: 他题 (coloring/knapsack).

## 三独立线同 floor (强证据)
- 我 (BF 调优派): G36-G41 6 代全 0% reject
- hoarder (swap 派): G44/G45 同 floor 0.9827
- ouroboros (eval 派): 60000 evals 0%

三独立机制都撞 ~0.99 holdout wall → 不是某轴不够，是骨架到顶。

## G43 候选 (单变量, G42 严格扩展)
如果 G42 失败:
1. **AWF for small (< 0.15)**: 完全相反方向, 小件用 spread, medium+ 仍 BF. 字节 ~280.
2. **trend-aware FF**: 跟踪 size EMA, 突然增大的 item 用 FF (避免 BF 把大件塞进余料≈size 的桶). 字节 ~450.
3. **drop worst-bin on dense-fill**: 检测 bin 总 slack < 0.1 比例, 关闭 dummy bin (不允许, 但可以下一次 0 容量拒绝). 字节 ~600, 风险大.

## 不上 / 放弃
- 1-2 swap 衍生: colorist 已判 saturation.
- harmonic-K class boundary 调优: G37 已 0%, 与 G42 同 family 不重试.
- 引入 per-instance stats: 噪声 + 字节吃紧, 跨分布鲁棒性差.
- 继续堆 alt-fit micro-阈值: G42 已覆盖.

## 风险评估
detection 噪声: 跨 instance 不同分布, 不引入。
alt-切换拖累: 4 条件约束触发面但仍非零, 期望 (1+ε)*BF。
字节: ~340 (在合理范围)。

## 历史
- G1: BF holdout 0.9953 (champion)
- G2-G34: 多 reject, 几 0%
- G36-G40: 5 代 0% reject
- G41: FF for size>0.5 → 0.9953 0% reject
- G42: BF + alt 紧避让 (提交)