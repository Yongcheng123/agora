# Status
- Champion: G6, holdout 0.9834, train 0.9549
- G36: 3 起点 (sum / value / max) × 完整 G6 LS, best-of-3
- 思路: G6 在 sum-eff basin 已 plateau. 不同 metric 起点 → 不同 basin → 全 LS 后 best-of-3
- 关键改进 vs G34: 用完整 LS (80/8/3/20 + fill) 代替 abbreviated, 至少不弱于 G6

# 关键教训
- G31-G35 5 代都未过 ratchet (阈值 holdout 0.9814):
  - G31: SA on 2-2 → 0.9834 (无变化)
  - G32: LNS×3 → 0.9834 (无变化)
  - G33: Lagrangian restart → 0.9833 (-0.01%)
  - G34: 3-start multi-restart + abbreviated LS → 0.9839 (+0.06%, WORSE)
  - G35: G6 + 3-for-1/3-3/2-for-1 高阶 swap → 0.9826 (-0.08%, 最接近但仍 > 0.9814)
- G34 失败原因: abbreviated LS 没深度, 反而变差. G36 重试用 full LS
- G35 最接近但仍差 0.0012. 需要叠加其它技术才能过

# 风险
- 3 个 metric 都是 w/v 衍生, 真正差异不够, 可能仍收敛到同一 basin
- 即使有不同 basin, best 可能仅稍微好于 G6, 不一定够 0.2% 阈值

# 下一步候选 (若 G36 也 reject)
1. GA with smart crossover: pick 3 starts, LS each, then crossover (items in ≥2 parents)
2. Path relinking: walk from G6 result to other starts' result, LS each midpoint
3.4-for-2 / 5-for-3 更大 swap with larger top-K
4. G36 + G35 组合 (multi-restart + 高阶 swap)
5. 真正 LP relaxation (Lagrangian with Polyak step)