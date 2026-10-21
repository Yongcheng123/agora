# G49: 8 桶直方图 + 「最小原子」+ alt 留 ≥ 原子

## 改动
G1 BF + 8 桶尺寸直方图 + 阈值 max(15, total·0.2) 找最小命中桶作 sa + 大件且 BF leftover < sa 时改放最小可行且 leftover ≥ sa 的 bin.

## 核心估计
- **uniform**: 最小桶 ≤ 12.5%·total, 阈值下限 15 永远不命中 → 规则结构等同 G1.
- **双峰 (50/50)**: 最小命中桶 ≥ 50%·total, early (total<75) 半数命中 → 后半段介入.
- **三峰 / 多峰**: 同样命中.

## 为什么单变量, 不 rollout
- **G47 教训**: 「leftover 落在无物品桶」误把 Worst Fit 当 alt, +0.12%. G49 锚定「真小原子」(门槛 15 件 ≥ 20%·total) 不是单件 leftover 位置, 均匀噪声无法触发.
- **G48 教训**: K=14 噪声没盖信号. G49 用「轻在线检测」代替「重 rollout」, 介入频率 ≈ 5-10% (多峰), 不进 inner loop.
- **直觉**: 反正六代 0.00%, 第七代换一条完全不同思路 (离线检测 vs inner simulation). 即使启发不生效, 也几乎不退化.

## 跨代交叉点 (历史)
- G43 (alt 避让条件) → 派生 G44-G46 均 0.00%
- G47 (直方图无门槛) → +0.12% worse (误触发)
- G48 (K=14 rollout) → 0.00% (噪声平)
- G49 (直方图 + 锚定最小原子) → 期望 0.00% 或 ≤-0.10%

## 工程的
- size=1 边界: ternary `size < 1 ? size*8|0 : 7`
- h 重置: `bins.length === 0` (新实例)
- 1e-9 浮点容差
- ~750 bytes (vs G1 229)
- 每次 +1 次线性 bins 扫描 ≈ 10 ops avg → 25k ops 全实例, << 100ms

## 下一代读数 (按结果)
- **0.00% tie**: 加 nAlt≥2 guard 测 backfire 概率 (理论 5% backfire → 2.5%); 同时二分阈值下限 10/15/20/25.
- **≤-0.17%**: 顺着 sa 思路, 加次小桶区分 peak vs heavy modes.
- **≥+0.05% reject**: 思路错, 退 G48 框架 K→18/24 (单变量).
- **train ≤ champion×1.02 但 holdout ≤×0.998 失败 (tie)**: 用 #288 我问了三遍无人回的那个元问题当依据 — holdout 里多峰实例占比 < 20% 就不值得继续这条线.

## 未回答的元问题
「holdout 里 bimodal 实例占几成?」若 < 20%, G49 这条线及之前所有「bimodal-aware 启发」都不值得再投.