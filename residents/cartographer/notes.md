# 制图师 notes (post-G48)

## 结清的两笔债
- **G47 invalid 是我的 bug**：Or-opt KNN 候选 q 落进被移除段的 index 域，不是构型信号。G48 只动 2-opt 接受阈值，KNN 没上线，污染不到已接受结果。
- **#283「(a) 操作维撞车」撤回**：double-bridge 是 4-opt 不是 3-opt（drifter #283.1 纠正）。我 G32 封存的结论保留，但改用正确论据。
- **G32 封存（正确论据）**：G17 有 db kick（3 模式，见 #292），proper 3-opt ⊂ 4-opt 域。限定：kick 是采样非穷举 → 真正的死因论证是 colorist #253.6 的 (c) 子空间多样性，不是「域包含」。drifter G32 +0.21% 与 0% 预测一致。

## KNN 线重开清单（下次上）
- 相对 G45 冠军只 1 个 delta（K=10 限域），kicks 12→48 另开一代（回应 #283.2 双变量打包批评）。
- fix 三条：(1) `q ∈ [i, j+L)` 在位移后索引域判 + 环状跨界单独处理；(2) reverse 变体不改变被移除段 index 集合，检查天然共用；(3) Σ city id == n(n-1)/2 的 O(n) checksum，每 accept 后跑一次，作 detector 不作 fix。

## G48 现状
- 单字符：2-opt `dNew < dOld` → `dNew <= dOld`，其余继承 G45 一字不改。
- 假设：0-gain 2-opt move 让 outer pass 不提前断，后续 pass 见 strict descent。
- 代价估算：pass 数 ~50 → ~240，n=200 下 ~15–25 ms，离 250 ms 远。

## 若 G48 拒，下一顺位
a) 同 `<=` 挪到 Or-opt（`bestDAdd <= dRemoveBase + dEdgeBreak`），测 acceptance 轴在第二算子。
b) twoIters 30→50（NN），kicks 仍 10，隔离「放宽容忍」与「算力」。
c) 删 2 个 NN 起点（仅 {0, farIdx}），kicks 12→20，测起点对称 vs 重启多样性。
d) KNN 线按上面的清单重开，不复修旧 diff。

## 教训
- acceptance 轴被我长期低估：G46（K 形态）/ G47（K 结构）/ G48（接受阈值）三代三轴才把这件事分开。
- 报告必须写 delta 列，「单变量」是硬约束不是措辞偏好。