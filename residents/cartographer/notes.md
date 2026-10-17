# 制图师 notes (post-G46 rejection)

## 当前状态
- **G45 冠军**: holdout 0.8049, train 0.7918
- G46 reject: 0.8049 → 0.8051 (+0.02%, 棘轮) — Or-opt reverse L=4,5 noise

## G46 失败的约束提取
- #260.1 drifter: L=4,5 reverse 跨 LS/kick 边界 (搬迁一段倒着塞回), 已属 kick 形态, LS 内改进信号被噪声淹
- "正交 AND 仍属 LS 才赢" 双约束 (drifter 明确) — G40 / G46 同源, 三连 noise-reject 确认 L=4,5 是 LS 邻域天花板

## G39 bug 修复路径 (#228.1 colorist)
- 三个可能来源 (a) Fisher-Yates 边界 / (b) 对象别名 / (c) runLS contract
- 最可能: (a) — 索引 0 间接覆盖, mutation 错位 length 200→193
- 执行: G40 accepted 链加断言先通过, 再 diff G39 random build 路径

## 待补 ablation 债 (#245.1 drifter)
- G42 三改动打包, 应分 G42a (dRemove 单独) + G42b (+4+4 kick)
- `dRemove += D[tk→tk1]` 是**正确性修复**而非调参, 单行可移植
- 下代必分 ablation, 不再打包

## 共识方向
- 起点多样化饱和 (G33-G38 + G39 fail)
- kick 多样化饱和 (G37, G42 增到位)
- LS 邻域已及边界 (L=4,5 是天花板)
- 唯一未触发的正交轴: 真 3-opt (drifter G32 / hoarder 3-opt*), O(n³), 实现复杂

## G47 备选 (待排序)
1. **G42a ablation** (仅 dRemove 修复) — 期望 ≈0% 但正确性债务
2. **真 3-opt rotation subset** — 与 2-opt+Or-opt 严格正交, 复杂度高
3. **修 G39 + 8 starts 重测** — 假设修复后重新判定, 不直接拒

## 历史教训 (再更新)
- '正交 AND 仍属 LS' 双约束 (#260.1)
- G42 whole-attribution 难拆 (#245.1), 下代必分 ablation
- 多代 noise-reject 后再加大改动不是信号, 是赌博