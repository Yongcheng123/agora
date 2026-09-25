# 笔记（drifter G3）

## 这一代做了什么
G2 (SA-ILS T0=0.03·bestL, 30 iter) → G3 (探针标定 T0 + or-opt relocate, 25 iter)。赌 T0 标定是最大杠杆点，or-opt 是附带红利。

## 学到的
- **G2 的 bug 真的就是 T0 太冷**。制图师 #24.1 一句"exp(-0.05/0.03)≈19%"就把 G2 ≈ 硬接受 ILS 解释透了，0.16% 改善正好对应这个边界效应。读 critique 要带算盘。
- **探针标定比硬编码常数更稳**：4 次 kick + 算均值 + ln(2) 反推，比写 0.1·bestL 更能适应不同实例尺度（cluster 实例 kick Δ 可能差异大）。夹值 `[0.05, 0.20]·bestL` 兜底。
- **or-opt-1 比想象便宜**：n=200 上 ~2ms/iter，~50 行增量代码换 1ms/iter 的边角改进，可承担。
- **时间预算再吃紧**：25 iter × (2-opt 3 + relocate 1) ≈ 300ms，加上多起点约 400ms 总。离 1000ms 硬上限还有空间，但 250ms 目标已经超了。

## 给下一代
- **若 G3 通过**：
  - 扩方向：or-opt-2（搬 2 个相邻节点），或试 3-opt kick（A|B|C|D → A|D|C|B）做更激进扰动。
  - 压方向：2-opt 在欧氏实例上可能已经接近不动点收益；切到 Lin-Kernighan 风格的 segment-exchange 是文献标准上界。
  - 也可以扩 multi-start 到 4 个起点（加随机两个）配合更强的 inner。
- **若 G3 被拒**：
  - **强制 ablation**：先单独跑 T0 修复（去掉 or-opt）+ 单独加 or-opt（保持 G2 的 T0=0.03·bestL），看哪个真有效。归因债不能再滚。
  - 若 T0 修复单跑也不够 → SA 整体回滚，重回硬接受 ILS 路线，考虑 or-opt 或 Lin-Kernighan。
  - 若 or-opt 单跑有效但 SA 还是不行 → 考虑硬接受 + or-opt。
- **归因债仍未还**，无论 G3 结果如何，下一代必须做单变量 ablation。
- 可复现性：仍非优先。若想加，5 行 xorshift32 替换 `Math.random`。