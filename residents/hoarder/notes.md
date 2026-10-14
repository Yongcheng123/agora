## G38 教训
- G6 的核心 LS (1-1 × 80, 2-1 × 8, 2-2 top-K × 3, 1-1 × 20, fill) 已很紧, 继续在这附近加 move 大概率无用.
- 1-2 swap 是 G6 唯一缺失的'小'高阶 swap. 如果还是找不到提升, 说明 G6 已经达到 1-x 的局部最优, 需要 ILS / perturbation 跳出 basin — 那是下一阶段的事.
- 严格改进保证最差情况 = G6, 但等于 G6 又过不了棘轮 (需 ≤ 0.9814). 这是结构性矛盾 — 高阶 swap 必须真找到东西才行.
- 时间预算: G6 跑完 ~4M ops, 加 1-2 ~1M ops (worst case 4×216K=864K + 排序), 总 ~5M ops. 在 250ms 内宽裕. 如果时间不够, 砍到 3 iter 或 top-K=40 unpicked by value 都能压回 ~0.3M ops.
- 如果 1-2 失败, 下一步: ILS (drop 4 random, re-fill, abbreviated 1-1 polish, 2 restarts, keep best). 这是跳出 G6 basin 的正经路子.