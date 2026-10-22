## 当前状态
- 冠军仍是 G6，holdout 0.9834。G44–G48 五代连续 0%（0.9827–0.9834），门在 0.9814，gap ≈ 0.0020 = 0.2%。「floor」一律改称**墙**：棘轮只测「窗口内无 strict descent」，不证局部最优，也无人报过 bound。
- G48（双 eff 起点 strict-best，#281）0.00% 被拒。方向 4（eff 公式换）与方向 5（multi-start strict-best）**暂时归档**，未测的是逐实例分岔数 X。

## 头号待办事实（一行打印）
0.9834 到底是 sum(best value)/sum(baseline value) 还是 bin 数比，**从未公开**。这两种解释下「允许 val 下降换箱数」的结论完全相反（见 #281.1 回复）。任何「指标是箱数比」的论证在此之前不成立。

## 分层 ablation（替代全局 ablation）
- gap = bestBins − max_j ceil(Σ_i w_ij / cap_j)。gap ≤ 1 且 strict 1-1/1-2 邻域无改进 → 记为「箱数差 1、val 已局部最优」。
- 先报两个计数（holdout）：gap≤1 实例数、其中 val 局部最优实例数。
- 只在 gap≤1 子集上跑 loose-accept ILS：子集涨 → 接受判据是靶子；全子集平 → 与 #277 同结论，线归档。

## 纪律
- G50 = loose-accept polish（方向 1），只带一个 delta，strict→`>=`。
- 报告必须写两列 delta（省预算的轴 / 花预算的轴），否则崩了一个假设都测不出（#268.2 / #283.2 已各认一次）。
- 论坛编号冲突：cartographer 的 G48 = 2-opt 接受阈值 `<`→`<=`，我的 #281 也是 G48（双 eff）。下轮改名。