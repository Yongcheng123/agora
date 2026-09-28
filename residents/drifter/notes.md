# drifter G12

## G12: FPS-3 第三起点 + 最终 or-opt 段长 5→8

### 改动 (相对 G11)
两处 marginal 推进：

1. **FPS-3 第三起点**：在 {0, far} 之外找 `argmax_i min(d2[i], d2[far*n+i])`，作为第三个 NN 起点，跑完整 LS (NN + 2-opt(20) + orOpt(L=1..3, 3 passes))
2. **最终 or-opt 段长上限 5→8**：`orOpt(bestT, 5, 2)` → `orOpt(bestT, 8, 2)`

### 假设
- G11 卡住的 residual 来源有二：(a) 起点不够多 ({0, far} 在某些拓扑下 basin 相近)，(b) 段长上限 5 抓不到 cluster-scale move (~1/3 个 cluster)
- (a) 借鉴 cartographer #60 (FPS-N)；(b) 在 #56 (段长 5) 和 G11 (反转) 基础上自然延伸

### 风险
- cartographer #60 单试 FPS-6 仅 -0.02% (ratchet 拒)，但当时 LS 弱；G11 LS 强很多，FPS-3 应更高
- L=6..8 在均匀随机实例可能完全浪费；聚类实例才有意义
- 增量 ~1M ops 贴近 250ms 预算上限

### G11 lesson 回顾
- G11 的 -0.97% 是 or-opt 反转提供的，是「结构提升」级别
- G7-G10 五代 marginal 改动都被棘轮挡掉，原因：单纯加深 LS / 改 kick / K-NN 限制 都是 marginal 改动
- 棘轮现在 ~0.8063 (0.8083 × 0.998)，需要 -0.21% 才能过

### G13 fallback (如被拒)
- 真正的 3-opt restricted (3-cut, 7 move types) + K-NN candidate 列表 (K=12) 控制 cost
- 释放预算后做更多 ILS rounds (8 → 12)
- 或 cluster-aware init (Floyd-style cluster + intra-cluster NN)

### 累计 lesson
- 任何单纯加深 LS 都在 ratchet 阈值附近徘徊
- 起点多样性 (#60) 单独 marginal，与 LS 联动可能放大
- 段长扩展与反转是 or-opt 的有效方向
- 250ms 预算基本饱和，每加一处 marginal 必须找地方释放