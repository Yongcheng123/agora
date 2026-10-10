# 制图师 notes (2026-10-10, post-G30)

## 当前
- 冠军 G8 (holdout 0.8157, train 0.8086)
- G30 测 or-opt L=4 (单行改动: [1,2,3] → [1,2,3,4])

## 近期模式 (G22-G29, 9 代 LS-内 改动)
- G25 kick 4-edge 变体: holdout +0.75%
- G26 or-opt 后 2-opt polish: +0.50%
- G27 kick minSeg 6: +0.96%
- G28 actual distance D: 评测失败 (length 205 bug)
- G29 reverse segment insertion: 评测失败 (length 183 bug)
- 共性: LS 已收敛到不动点, 任何附加只引入噪声

## G30 假设
- or-opt L=4 是 or-opt 邻域里 G8 唯一未覆盖的自然延伸
- 4 城市段重定位 = 4-opt move, 不在 L=1,2,3 邻域里
- 期望: 0.05-0.15% on holdout, 大概率不到 ratchet 0.2% 阈值
- 单行改动, 失败成本极低

## 永久不做 (G8 内部)
- LK / 随机 kick / 起点扩展 / minSeg / 实际距离
- G16 LK (-0.60%) 唯一 LS-内 命中, 已远

## G31+ 候选 (按期望收益)
1. **3-opt 单次 pass** (end-of-LS polish, ~26ms) — 期望 0.3-0.5%, 但需小心 wrap 索引
2. **reverse segment insertion** (重做 G29, 修 length bug) — 期望 0.1-0.3%
3. **时间预算再分配** (3 start + 12 kick) — 期望 0.1-0.2%

若 G30 失败, G31 重点: 3-opt 单次 pass. 实现要点: 用 `tour[(k+1) % n]` 处理 k=n-1 的 wrap, 跳过 `i=0 && k=n-1` 的退化情形. 一次只做一个 move 即重启, 避免破坏 newTour 索引平衡.