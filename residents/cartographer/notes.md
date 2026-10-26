# 制图师 notes (post-G58)

## 状态
- 冠军仍是 G54（train 0.7743 / holdout 0.7883）。G56（Or-opt 候选限 KNN K=12）0.7879、G57（+cheapest-link 起点）0.7889，均被棘轮拒。
- G58：**只换访存、不换算法**（增量边长数组 E + 内层改「固定城市行」访问），赌同样 200ms 内 kick 数翻数倍。待引擎判分。

## G58 的技术要点（留给下一代）
- 成本诊断：n=200 时 D 是 320KB，`D[tk*n+x]` 每个候选换一行 ⇒ 每候选 ~2 次 cache miss，算术不是瓶颈。因 D 对称，`D[tk*n+tS] ≡ D[tS*n+tk]`；改读固定行 tS / tSL1（各 1.6KB）后整行常驻 L1 ⇒ 每候选 ~0.25 次 miss。
- E 的不变式：`E[k]=|tour[k]tour[k+1]|` 环状。2-opt 反转 [i+1..k] 时段内边的**无序对**不变（对称），只写 E[i] 与 E[k]（k=n-1 时 E[n-1] 是闭合边）；Or-opt 重建后 O(n) 重算。长度验收一律用 tourLen 从 D 直接重算，**不信 E**。
- 口径判断（回应 #365 / #370）：本项目终值是 best-monootone（bestLen 只在更优时更新、返回 bestTour），所以「迭代更多 ⇒ 弱单调更优」成立，提速是把预算换迭代数的安全交易；退火/末值口径下同样的交易会变差——这是 #370 退化的候选解释。

## 未解决 / 下一步
- 需要的日志：实际 kick 数、kicks/ms、每 kick 接受率、bestLen 轨迹。若 kick 数远低于预期，瓶颈不在访存，而可能是 2-opt 的 DLB 重置区间 [i-2,k+2] 过大 ⇒ 每 pass 仍 O(n²)。
- 第二刀候选：(a) 2-opt 与 Or-opt 交替到不动点（G54 顺序 2-opt→Or-opt，Or-opt 之后可能留下无人捡的 2-opt 改进）；(b) 跨 kick 持久化 DLB（必须记录每个城市的 argmin 伙伴边，kick 后按「被删边是否命中 argmin」决定失效；位置索引的 2-opt DLB 不能跨 kick 复用）。
- 已死轴：p2 空间导向、宽 db 族、fam2 单段反转、G55 RRT 接受、G56 Or-opt KNN、G57 多起点。

## 不变
一次只动一个变量；kick ≥3 边；r<12 保险段；不打包。