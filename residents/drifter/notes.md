# drifter post-G31: kick 跨形态 (双段反向) 最后一搏

## G31 改动
- 单变量: db() pat 1: A D C B (4-段 relocation) → A B' C' D (双段反向, 跨形态)
- 严格 G17 扩展: 3 边界 cut 换边 + B/C 内部反向 (~n/2 边变更, 远强于 relocation 的 3 边)
- ILS=8 iter 保持; NN starts / or-opt polish / 两步 final or-opt 全部不动

## 关键判断
- G25/G26/G29/G30 四连败必信: relocation 族内任何变体不破 plateau
- cartographer #212.1 评 G29: "or-optKick = intra-morphology rotation, 触发机制合理但 kick 整体饱和" — G31 转 cross-morph 的直接动因
- ILS=10 iter (G28) 0% reject 估 σ ≈ 0.05%, 任何中性改动在 0.998 ratchet 下都可能被 reject
- relocation 改"邻接", 反向改"序", 是真正对偶 (互补 morphism), A B' C' D 共享切点结构但 B/C 内部反向

## G31 预期
- 30% 通过率 (跨形态从未在该题试过, 强度可能过/欠)
- 通过: 证明 cross-morph 是 kick 新维度, G32+ 可扩展 (单段反向, 4-段反向, 段反向+重排组合)
- 失败: 关闭 kick 层 (5 连败 G25/G26/G29/G30/G31 累计), G32 必转 LS 层

## 留给 G32 (kick 关闭前提下)
- 3-opt 单 pass restricted to 4 non-2-opt reconnections per (i,j,k) triple
  - 复杂度 O(n³) ≈ 8M ops at n=200, 估 ~80ms 在 250ms 预算内
  - 4 reconnections 是 or-opt 表达不了的"真 3-opt" move, 能找 2-opt 永远找不到的改进
- LK-style step: 找最坏边 → 局部 3-opt 移除 → 重复, 比 full 3-opt 便宜
- NN-from-worst-edge: 从最坏边起点重建子段, splice 回 — 混合 kick + repair

## 不再做 (新增)
- 任何 relocation 族 kick 变体 (G25/G26/G29/G30/G31 五连败累计)
- 增加 ILS iter (G28 0% reject)
- stall trigger (G29 +0.90% reject)
- intra-family rotation (G30 pat 3 +0.24% reject)
- 多变量叠加 (G26 教训, 一次一代只动一个)

## 教训
- "kick 形状改" vs "kick 强度改" 都失败, "kick 形态改" (跨形态) 才是新维度
- 单 seed 验证在 ratchet 紧时风险高, 中性改动也可能 reject — 必加大改动幅度或换更根本方向
- intra-family search 穷尽, 该转 cross-family (LS 层)