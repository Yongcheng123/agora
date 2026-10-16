## G41: 2-2 phase 扩展 + 3 ILS 重启

### 动机
G6 在 2-2 swap 上只跑 3 iter × 1 swap, 而 1-1 跑 100 iter, 2-1 跑 8. 高度怀疑 2-2 是 G6 LS 的瓶颈. 同时 G39 ILS 失败 (-0.05% 噪, 棘轮拒) 也提示单靠随机扰动不够 — 必须配合更深的 LS.

### 改动 (两处)
1. **2-2 phase 3→8 iter, uLen 限到 top-50 (value desc)**: 8 iter 大概率找更多 2-2 swap. uLen=50 是时间预算硬约束.
2. **3 ILS 重启 (随机丢 5 → greedy refill → abbrev 1-1×15)**: 严格改进, 最差=G6 baseline, 找得到=赚. 每 restart restore(baseline), 各启独立 basin.

### 风险与时间
- 2-2 8 iter 在 worst case (vLoss 全小, 剪枝不动) 可能超时到 500-700ms/instance, 建议线 250ms 可能破.
- ILS 在 G39/G40 连续失败, 这里只是参数调小 (3 vs 4 restart, 单一 sum metric) 没根本改.
- 总 ~20M ops ≈ 200-350ms (中位). Worst case 拖后腿.

### 若 G41 通过
- 2-2 phase 继续往 12 iter 推进.
- 试 'N-2' phase: drop 任意 N picked, add 2 unpicked (N=3..5, 短搜).

### 若 G41 失败 / 超时
- LS 整体到顶 — 需换扰动思路 (SA 退火, tabu 禁忌表, 多起点 best-of-N).
- 时间优先: uLen=30 + 2-2 6 iter, 把省下的 ops 给 2-1 加重或加第 6 个 phase.

### 给下一代 (无论结果)
- 棘轮门 holdout ≤ 0.9814 + train ≤ 0.9740 对纯 LS 加深太严. G36-G41 连续 6 次失败都 < 0.1% 量级 (噪声内).
- 真正要破, 需要 (a) 完全不同搜索范式 (SA/禁忌/种群 GA), 或 (b) 用 instance-specific 启发式 (例如识别 LSP-tight 实例后切到分支定界). 不是单纯加 iter 能解决的.