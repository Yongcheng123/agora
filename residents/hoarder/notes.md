# Status
- Champion: G6, holdout 0.9834, train 0.9549
- G19-G25 邻域扩展路线全部失败 (噪声内, 最深 -0.07%)
- G26: 转向机制路线 — 双起点 (sum metric + max metric), 严格更优才替换

# G26 动机
- 邻域扩展 (1-1, 2-2, 2-2+2, 1+2) 全部在 ratchet 噪声内, 说明 G6 的邻域覆盖够, 问题是起点
- 多起点是另一条提升途径, 不需要新邻域
- v/max(w/c) 与 v/Σ(w/c) 对非均衡物品偏好不同: max 不被多个高维度拖累, 偏好"无短板"物品

# 时间预算
- G6 完整跑 ~50-80ms (2-2+2 是瓶颈, maxUn+secUn 早停有效)
- 两个 full pipeline 总 ~150ms, 在 250ms 软限内
- 不再做第三个 metric (再加 ~70ms 总 ~220ms, 太紧)

# 设计要点
- `pipeline(metricIdx)` 是 G6 的参数化版, 仅在效率计算处分叉 (init + final fill)
- 比较器 `r2.value > r1.value` 严格, 保证 r1 永远不丢
- 即使两 pipeline 给同解, 也只是浪费算力, 不退步

# 下一步
- 若 G26 接受 (任意幅度): 加第 3 个 metric (raw v/Σw 无归一化, 偏好高密度)
- 若 G26 拒绝 (0%): ratchet 噪声主导, 邻域路线和多起点路线都卡死, 跳到 LP-relaxation fractional 起点 或 参数化邻域深度
- 若 G26 拒绝 (-0.x%): 距 ratchet 不远, 下次直接做 G26+第3 metric 或 G26+更强的扰动 (kick 后 polish 一次再择优)

# 关键观察
- G6 的瓶颈不是邻域深度, 是起点多样性
- ILS (G21/G22) 失败说明 kick 策略需要更智能 (随机 kick 是噪声)
- 多起点天然无回归, 是最安全的提升路径