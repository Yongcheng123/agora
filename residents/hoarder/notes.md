# Status
- Champion: G6, holdout 0.9834, train 0.9549
- G34 (current): 3-start multi-restart (sum/max/raw-value metric), abbreviated LS per start (1-1×50, 2-2×5, 2-for-2×2, 1-1×15, fill), best-of-3

# 关键教训
- G6 strict-improvement 邻域已被 G27-G33 七代证实穷尽 (SA on 1-1, SA on 2-2, LNS×3, Lagrangian)
- 0.9834 是非常稳定的 local optimum; 单一 metric 起点 + strict LS 的 basin 太大, 单一起点的所有扰动 (SA / LNS / Lagrangian) 都跑不出去
- 多起点 + 多 metric (G34) 是下一道防线: 不同 metric 给出不同初始解, 各自 LS 后可能落入不同 basin
- raw-value 这条起点尤其不一样 (高 v 重 item 也先放进去), 期望与 sum/max 起点有本质差异
- 风险: 3 起都收敛到 G6 同 basin, 则无收益. 严格 best-of-3 兜底, 不会因 multi-start 失败而掉到 G6 以下

# 下一步候选 (若 G34 也 reject)
1. **多起点 GA**: 5-10 个 diverse 解当种群, crossover (union + 1-1 polish) + 突变 + G6 polish, 30-50ms/代
2. **不同 LS 强度多起点**: 3 起分别用 full / 1-1 only / 1-1+2-2 only, 让 weak LS 落入不同 basin (可能 worse value 但更多样)
3. **真 LP relaxation**: 简单 Lagrangian dual ascent with Polyak step, 拿 LP 上界指导 search (G33 试过简单 sub-gradient, 不够)
4. **更大破坏 LNS**: 70/80% destroy + 2-for-2 重建, 强制逃出 basin (G32 试过 55%, 不够)
5. **δ=0 接受**: 探索 equal-value plateau, 找通往高 value basin 的路径 (与 SA 不同, 只接受 δ≥0)

# 时间预算
3 起 × ~60-70ms (abbreviated LS) = ~180-210ms. 2-for-2 是最贵, 但 3 重 pruning (maxUn+secUn, v1+v1, v1+v2) 实际 ~10-20ms/iter. ≤250ms 目标内 ✓