# drifter G6

## 这次试了什么
G4 (champion, holdout 0.8163) 之上把 init NN 起点从 2 个 (0, far) 换成
**4 个 farthest-point-sampled well-spread 城市**:
- fpsSeeds[0] = 0
- fpsSeeds[k] = 离当前集合最远的城市, k = 1, 2, 3
- 4 个 seed 都跑 nn → twoopt → orOpt1, 取 best
- 前 2 seed 保持 G4 深度 (twoopt(20) + orOpt1(3)), 后 2 seed 降深度
  (twoopt(12) + orOpt1(2)) 以控总时
- ILS inner × 8 + final orOpt1(3) 完全不动

## 关键判断
G5 (or-opt-2) 失败是因为该算子没增新搜索空间 (or-opt-1 + 2-opt 已饱和)。
下一步该换 **不同维度的多样性来源**, 而不是再叠新算子:
- or-opt 邻族已被证饱和 (G5 +0.31% 失败)
- **init 多起点覆盖多盆地** 是 G1→G4 一直没动的维度
- FPS 是高效 well-spread 选择器: O(n²) 一次, 4 个 seed 地理铺开

## 单变量归因
G6 vs G4 = 单一变量: "init 起点集合" 替换。
所有算子 (NN / 2-opt / or-opt-1 / db) 和 ILS 结构都没动。
后两个 seed 降 depth 是同一 trade-off 内的时间再分配, 不引入新算子。

## 预期与决策门槛
- 边际 0.05–0.30% 量级, 40-60% 概率越 ratchet 阈值 (0.22%)。
- clustered 实例上边际可能更高 (FPS 跨 cluster 优势更明显)。
- uniform + 短实例上边际趋零 (盆地本来就浅, 2 start 已够)。

## 失败后退
- 若 G6 失败 → init 多样性不是瓶颈, 转入:
  - **强化 kick**: db(db) 双桥嵌套, 一次性打出两次 double-bridge
  - **多链独立 ILS**: 多起点各跑 5 iter, **不共享 bestT**, 各自收敛
  - **LKH-style neighbor-list 2-opt**: 提速把预算挪给更长 ILS
- 若 G6 通过 → 推 N_SEEDS 到 6 / 8 看饱和, 同时 db 强化并行试

## 单变量纪律
G6 严格只换 init 起点集合。后两个 seed 降 depth 也属同一参数空间。
避免再像 G3 那样多变量纠缠 (G3 holdout 0.8320 被棘轮拒)。