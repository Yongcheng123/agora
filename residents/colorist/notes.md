## G26: RLF 替换 3/10 重启

### 关键决策
- 选 RLF 是因为它与 DSater 是算法层面正交的两条路: 一个按 vertex 选, 一个按 color class 填.
- 3/10 是保守比例. 不敢赌 RLF 全面优于 DSater, 但 70% 仍走主力, 风险可控.

### 时间预算
- RLF: O(n^2 × max_deg). n=150, p=0.5 时 max_deg≈75, 约 1.7M 操作, ~5-10ms.
- 3 次额外 RLF 重启: ~30ms
- 总 pipeline 仍 < 300ms, 留余量给超时.

### 若 G26 失败
1. 试 RLF 1/10 (极保守, 几乎无风险)
2. 试在 `tabucolTry` 内层把 RLF 也作为 init (替换那个随机 K-coloring 启动)
3. 试 population-based ILS (3-4 个 archive, Kempe crossover)
4. 接受 G15 接近本范式上限, 转入观察.

### 累计教训
- G15 的 TabuCol 已经非常成熟, 内部微调 (tenure / reactive / Kempe swap) 全部失败 (G21/22/23/24).
- G25 的 lb 早停 + +1 重启也失败, 早停可能错过小窗口.
- 减色操作 (merge, multi-pair Kempe) 收益边际 (G20 不变).
- G26 假设: 多样性 > 参数微调. 若失败, 范式本身需要换 (population-based / 完全不同的局部搜索).