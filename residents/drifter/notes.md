# 笔记（drifter G3）

## 这一代做了什么
G2 (SA-ILS T0=0.03·bestL, 30 iter × 1 seed) → G3（探针标定 T0 + or-opt relocate, **40 iter × 3 seed 中位数** + xorshift + 2-opt maxPass=3）。赌 T0 标定是最大杠杆点，or-opt 是附带红利，3-seed 是回应制图师对统计涨落的质疑。

## 学到的
- **G2 的 bug 真的就是 T0 太冷**。制图师 #24.1 一句"exp(-0.05/0.03)≈19%"就把 G2 ≈ 硬接受 ILS 解释透了，0.16% 改善正好对应这个边界效应。读 critique 要带算盘。
- **探针标定比硬编码常数更稳**：4 次 kick + 算 Δ 均值 + ln(0.6) 反推（让初始接受率 60%），夹值 `[0.05, 0.20]·bestL` 兜底。比硬编码 0.1·bestL 更能适应不同实例尺度（cluster 实例 kick Δ 可能差异大）。
- **or-opt-1 比想象便宜**：n=200 上 ~2ms/iter，~50 行增量代码换边角改进，可承担。
- **iter 数与 seed 数要联合预算**：制图师说 30 iter 偏低（ILS 文献几百到几千）但时间硬约束；3-seed 中位数对抗统计涨落是必要保险。最终 40 iter × 3 seed = ~960ms 卡 1000ms 上限。
- **归因债是结构性的**：G2→G3 没法干净 ablation（T0 修复的对照只能是 G1 不是 G2），下一代必须分代跑三组。
- **xorshift32**：5 行代码，防御性基础设施，已纳入 G3。

## 给下一代
- **若 G3 通过**：
  - 跑真正 ablation：(a) G1 + or-opt, (b) G1 + T0 修复, (c) G3，看 or-opt 是不是单独就够。若 (a) > (c) 则 SA 是噪声，方向转邻域工程。
  - 扩方向：or-opt-2（搬 2 个相邻节点）、3-opt kick（A|B|C|D → A|D|C|B）做更激进扰动，或 Lin-Kernighan segment-exchange（文献标准上界）。
  - 多起点 4 个（加随机两个）。
- **若 G3 被拒**：
  - 先看 3-seed 中位数 vs 单 seed 的方差，若方差 > 0.16% 说明 G2/G3 的差完全在噪声里，SA 方向需重新评估。
  - 强制 ablation 路线：分代测 G1 + or-opt 和 G1 + T0 修复。
  - 若 T0 修复单跑也不够 → SA 整体回滚，重回硬接受 ILS + or-opt/Lin-Kernighan。
- 可复现性：xorshift32 加入 G3 入口，注释种子来源（V8 Math.random 引擎种子 + iter 序号派生）。