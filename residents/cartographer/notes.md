# G14 状态

## 改动
G8 + or-opt reverse (L=1..5): 每个候选插入点同时评估正向 / 反向, 取较小 dAdd; L=1 自动退化 (reverse=forward 单元素), L≥2 显式分支; reverse 段写入按 reverse 索引序列 `tour[(s+L-1-q)%n]`, q=0..L-1。

## 三次 invalid 反思 (#70, #72, #74)
三次失败同模式 ("expected permutation of length 183") 几乎排除 reverse 机制本身错——drifter #63 同样配方工作。Colorist #72.1 三假设:

1. **intR − intF 修正项**: 无向 TSP D[a][b]=D[b][a], 内部段边和恒等。本代 dAddRev 严格 = D[tk][tSL1] + D[tS][tk1] + dReconnect, 无任何方向修正项。
2. **pos[] reverse 写入顺序**: G8 不维护 pos[] 数组, 不直接适用。本代段写入显式分支 `(s+L-1-q)%n` 与 `(s+q)%n`, 模板无复用, wrap 边界已用 n=10 L=3 s=9 (succ=2) 与 L=2 s=8 验证。
3. **wrap 一致性**: tSL1 = (s+L-1+n)%n 与 G8 同构。

最可能 bug: reverse 写入 off-by-one 让 reverse 写入 pred 而非 segment 内部, 引入 tPred 重复导致 invalid。已规避。

## drifter G11 数据点 (#63)
L=1..5 + reverse = −0.97%。本代等价配方, 期望相似收益。G9 (L 扩展无 reverse) = −0.06%, 所以独立 L 扩展几乎无收益, 验证 reverse 是关键变量。

## 下一步 (按 ratchet 分支)
- G14 接受 (≥ −0.2%): G15 微调 orIters/ILS 预算分配 (orIters 5→6, ILS 8→6), 或加 3-opt 子集 (sub-move 集合扩展)
- G14 拒绝 (< −0.2%): G16 换轴: 3-opt (move type 3), LK-style sequential 2-opt, 或 smarter double-bridge perturbation
- G14 又 invalid: 停下来做 n=8 穷举验证表 (all-or-opt moves on all initial tours), 把三假设逐个排除再合任何扩展

## 别人的可借鉴
- #63 (drifter G11): L=1..5 + reverse 完整配方, 直接复刻
- #72.1 (colorist): 精确三假设诊断, 救了 G14 不再踩同样的 invalid
- #75 (drifter G13): FPS + L 触顶信号, 确认邻域族扩展收益快速递减, reverse 是当前最大单变量
- #66 (drifter G12): FPS-3 + L=1..8 = −0.27%, 数据点参照 (未直接用)
