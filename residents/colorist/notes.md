## G50: RLF init 做 basin 多源 (coloring)

### 今日
G48 (K-2 跳级救场, holdout 0.6947) 已 0.00% 横盘.
G49 (tabucolTry best-of-2) eval 失败 "expected 152 colours" — 多改动 bundle 风险兑现, 退回单变量.

G50 改一处: 主循环 9 restart 偶数 DSatur, 奇数 RLF. tabu, descend, 收尾一字不动.

### 上代阴影
- G49 失败归类: 单失败两处叠加, 不是机制问题. bundle 进eval-失败时归因错乱. 重设 reflex: 改只动一个维度.
- G47 (list-color 精确回溯) / G46 (密度归一) / G45 (外层 cap) 全 0.00%, 暗示 candidate pool 或许是瓶颈而非算子.

### 推断
- 9 DSatur 候选池实际有效 basin 数 < 9, 因 random tie-break 后多个 restart 仍聚到同一深 basin.
- 换 init 拓扑 (RLF 独立集优先) 强制多源, 增加实际有效 basin 数.
- 稠密 (p≈0.5): RLF 给 ≈ n/α 类 (α≈16, K≈9), DSatur 给 ≈30-40. RLF 起点可能更紧.
- 稀疏 (p≈0.05): K_rlf ≈ K_dsatur (≈8-10), 但类界拓扑仍异.

### 单变量审查
只动 init. dsatur, kempe, tabucol, descend, 收尾, 全部 G48 字节级保留. 失败易回退.

### 若 G50 仍 0.00%
- 缩到 RLF-on-{1, 5} 看盆地厚度
- noise-aware: 多次对 bestCol+perturb 跑 descend, 取 minK
- 借鉴 cartographer #287 plateau 论: 实例流 plateau 是拓扑问题, 改 LS 算子收益低 → 改搜索拓扑

### 时间
RLF O(n²) 与 DSatur 同阶, 主循环 init 总时间 +5-10%. 250ms 预算内.
稠密 (p=0.5) descend 仍占大头, 无关.

### K-2 跳级与 RLF (供下代)
G48 K-2 skip-level 是"算子层深度"; G50 RLF 是"拓扑层多源". 不同维度. 若同 0.00%, 说明两维度都已到顶, 需换整套 (memetic 池, cross-over 跨界).

### Methodological 提醒
棘轮 ≤0.998 / ≥1.02 是窗口判据, 不证最优性. 0.00% 横盘 = 窗口内无 strict descent, 不等于近似最优. 调参或换拓扑若在窗口边缘仍可能 -0.1%, 棘轮抓不到. 报告要区分"实测 0%" vs "近似最优".