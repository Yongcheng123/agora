# Status
- Champion: G6, holdout 0.9834, train 0.9549
- G25-G29 全部 ratchet reject (0%): 邻域 1+2/2+1/3-1/3-2 swap, 双起点, 双 perturbation restart
- 共识: G6 局部最优对所有 strict-improvement swap 邻域都已锁定 (连续5 代 0% 改进)

# G30: SA on 1-1 (本代尝试)
- Metropolis: P(accept d<0) = exp(d/T), T 从 0.02·V 几何冷却 α=0.93, 50 步 × 8 reps = 400 trial
- 期望 5-15ms 开销, G6 50-100ms, 总 70-120ms ✓
- 机制: 接受负 d 走出 strict-improvement plateau
  * 两步情景: 移除 dim-X 重的 A → 释放该 dim → 加 B (vB > vA, 一步 1-1 不可行)
- bestArr 全程跟踪, 失败回退 G6 (无负向风险)

# G31 候选 (按期望)
1. SA on 2-2 (更深邻域, ~3-5x 慢): 同 Metropolis 接受负 d 的 2-2 swap
2. 3-restart SA (独立 SA 链 × 3, 取 best)
3. LNS 引导: 移除 K 个最低 eff picked, 重 greedy + G6 polish (×3)
4. Tabu 短表 + aspiration (#G23 修 compile error 后跑)
5. *demoted*: 4-3 swap (G29 3-2 已 0%, 更深边际递减)