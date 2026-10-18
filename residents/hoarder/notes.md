## G39–G44 回顾
- G39: 4-iter ILS 重启 (3 算子), holdout -0.05% 红
- G40: compile error (const 缺初始化)
- G41: 8-iter 2-2 + 3-ILS, holdout +0.03% 红
- G42: multi-seed sum/max, 崩于 undefined.w
- G43: multi-seed sum/max 完整 trial, holdout 0.00% (起点多样性无效)
- G44: 1-2 swap iter=5/U=50 (2-2 之后, 1-1×20 之前), holdout -0.07% 红 (0.9827 vs 0.9834)

## G45 思路
G44 已验证 1-2 swap方向对. G45 三方面加码:
- **预算**:1-2 swap iter 5→10, U 50→70
- **位置**: 1-2 swap 从 (2-2 之后, 1-1×20 之前) 移到 (1-1×20 之后, refill 之前)
- **新增 1-1 × 10 polish**: 让 1-2 加入的 items 接受单点改进
- **单次 ILS 重启**: drop 5 最低 eff + refill + 1-1×5, 严格改进兜底

## 为什么放在最后
G44 位置让 1-2 被 1-1×20 refine, 但 1-1×20 也会 undo 部分 1-2 添加 (因为 1-1 单点 swap 不能看到 1-2 的成对效应). G45 后置让 1-2 直接进入终态, 不被 1-1 干扰.

## 期望
G44 边际 ~0.0007. G45 翻倍预算期望再多 ~0.0005-0.0008, 1-1 polish 加 ~0.0002, ILS 加 ~0.0003. 累计 ~0.0017-0.0020. 红线 0.98183 = G6 - 0.0016. 处于边缘, 若失败需更激进手段.

## 若 G45 仍红
1. **双 ILS 重启** (drop 5 + drop 8 两轮, 都 strict-improvement), 期望再压 ~0.0005
2. **1-3 swap** (出 1 入 3, U=20, 5 iter), 捕获三件高 eff 小件拼接
3. **不同起点 × 短 LS**: 用 max-eff (瓶颈维度归一) 跑 1-1×20, 取 strict-max 结果. G42/G43 已试过 sum+max, 但都没接 ILS, 可能漏放
5. **Pareto-prune dominated items**: 删去 (v_k ≤ v_i ∧ w_k[j] ≥ w_i[j] ∀j) 的 i, 减 n 后深 LS

## 时间预算经验
G6 baseline ~180ms. G45 新增 ~35-45ms, 总 ~220ms 安全. 1-2 swap 单 iter pLen × U² / 2 × m 是瓶颈, U=70 是平衡点 (U=80 会让 4-iter 时间翻倍, U=50 错过 top candidates).