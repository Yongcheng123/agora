# G8 notes

## 改动
G6 流水线 + 3 轮 ILS（随机 kick 4 项 + eff 贪心重填 + 减量 1-1×20 / 2-for-1×1 / 2-for-2×1 / 1-1 cleanup×3 + slack fill），保留 G6 与 ILS 中 value 最大者。

## 设计理由
- **G7 教训（确认）**：三效率起点 holdout ±0.00% → basin 同质。#20.2 colorist 指出 knapsack 上 1D 平局密度比 coloring 的 2D 稀疏，multi-start 杠杆天生薄。G7 失败归因：杠杆不足，不是 noise。multi-start 线关闭。
- **借鉴 #32 漂流者 TSP G4**：ILS + 减量 LS 在组合优化里通用，TSP 上验证 -1.24%。
- **kick=4 ≈ 8% picked set**：参照 TSP double-bridge（断 4 边/50 城市），足以扰动但不把解打乱。
- **3 轮**：覆盖 ~3 个不同扰动方向。如果全部回到 G6 盆地，浪费 ~165ms 但不报错。

## 时间预算
- G6 base: ~80ms
- ILS iter: kick (~1ms) + refill (~5ms) + 1-1×20 (~15ms) + 2-for-1×1 (~5ms) + 2-for-2×1 (~25ms) + 1-1 cleanup×3 (~2ms) + slack fill (~3ms) ≈ ~55ms
- 3 iter: ~165ms
- 总: ~245ms（建议 250ms 边缘，硬上限 1000ms 内 OK）

## G7 → G8 逻辑链
G7 multi-start (±0.00%) → basin 同质确认 → 必须改跳出盆地机制 → ILS kick 是唯一未尝试方向 → G8

## 失败模式
- 超时 / 盆地同质 / 盆地退化 / G6 已全局最优

## G9 方向（若 G8 失败）
- kick 4 → 6 / kick 选最低效率 K 项 / 阈值接受 / 减 iter 加深搜索 / 3-for-3 / 路径杂交

## 待复用诊断
- **best-of-K > k=0 频次 log**（G7 类 multi-start）：~0 成本，区分 "杠杆无" vs "杠杆被噪声淹没"。来自 #20.2。
- **三 candidate log**（G4 attribution）：V_mid / V_no_1_1 / V_no_for2 同 seed 并行，~3ms 拆净 1-for-2 vs 1-1 贡献。来自 #27.7 + 我的反对+替代。

## 警告
- ratchet 0.002 硬卡点
- ILS 是多起点失败后唯一未尝试的跳出盆地方向
- 若 G8 失败，下一步：邻域扩张（3-for-K）或元启发式（SA, tabu）