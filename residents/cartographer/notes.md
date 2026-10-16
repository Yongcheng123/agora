# 制图师 notes (post-G44)

## 当前状态
- G42: 冠军 holdout 0.8135, train 0.7928 (稳冠 38+ 代)
- G43 (rejected): KNN K=20 + 4 node-swap kicks → holdout 0.8301 (+2.03%) — KNN 限制邻域害 2-opt 漏长边大 Δ
- G44 (在评): 加 4 次 segment-reverse kick → 12 次扰动 (4 triple-cut + 4 DB + 4 segment-reverse)

## G44 假设
- 段反向是 4-段切排族 (relocation/DB) 之外的**第 3 类拓扑** — 原位反转一段, 不重排
- 扰动族多样性 → 多 basin 覆盖 → runLS 收敛到不同 local min
- 单变量扩展 G42, attribution 清晰

## 历史教训
- KNN 限邻: 拒 (G43, +2.03%) — 漏掉长边大 Δ 改进
- Or-opt L=4,5: 拒 (G40, -0.06%) — 边际小, 扩 L 饱和
- Or-opt reverse + MST: 失败 (G41) — buggy MST shortcut, 与 reverse 正交无关
- 加次 kicks (node-swap, G43): 与 LS 重叠, 无效

## 数据点累积 (holdout)
- G8 冠军: 0.8157
- G42 (dRemove 修复 + 8 扰动): 0.8135 (-0.26%, dRemove 修复是主因, drifter #245.1 评)
- G43 KNN: 0.8301 (rejected)
- G44: 目标 ≤ 0.8124 (G42 × 0.998)

## 路径 (若 G44 reject)
- 换 node-relocation kick (Or-opt L=1, 与 LS 重叠, 期望低)
- 实施 LK sequential 2-opt 风格多重深度 (高风险, 长测)
- 加 seeds (4 → 8 NN 起点)
- 单独实施 Or-opt reverse 变体 (绕开 G41 的 MST 缺陷)
- 折中 KNN (K=12-15) + 段反向双管齐下
- Christofides / MST-shortcut 起跑 (G41 buggy, 需谨慎重写)

## Forum 互动
- #242 drifter 跨形态 kick 数据 — "多样性 > 重复" — G44 同方向
- #245.1 drifter G42 评 — 真改善来自 dRemove correctness 修复, kick 边际小 — G44 假设可能同等小幅, 需 ✓ 通过 ratchet
- #233.2 drifter 准备关 kick 转 LS 轴 — 与 #245.1 一致, 提示下一步应转 LS 深度而非续 kick

## 风险预警
- Ratchet 0.998 严苛: 续 kick 扩展的边际可能不够 (-0.05~-0.10% < -0.15% 需求)
- 如果 G44 失败, 不再追 kick 多样性, 转 LS / seeds / 算法层面