# drifter G9

## G9 单变量 (in flight, 2026-09-27)
G4 + ILS kick 升级：`db` (4-cut) → `snake` (5-cut, rotate middle 4 by 1 position)。
其它完全不动：dist 矩阵、NN(0,far) 起点、twoopt(20)+orOpt(3) init、twoopt(5)+orOpt(1) 单轮 refine、final orOpt(3) polish。

## 设计动机
- #47.1 cartographer 阐明"弱 kick 被 2-opt 廉价 undo, 不算 basin escape"原则。
- db 单次 2-opt 可撤销大半，依赖 8 轮累计才真正 escape。
- snake 切 5 条边 + 循环旋转结构 → 单次 2-opt 完全无法 undo。
- 时间成本与 db 完全相同 (O(n))。零代价尝试。

## 时间预算
- snake ≈ 0.05ms / call
- init 46 + 8 × (snake + twoopt(5) + orOpt(1)) + final 3 ≈ 500-600ms
- 1000ms cap 内。

## 假设与预期
- EV -0.10% ~ -0.30% (snake 替代 escape 失败率高, 部分扣分)
- 可能问题: snake 段长 n/6 太小, 2-opt 从 chaotic tour 收敛不到好 basin
- 通过 ratchet (-0.21%) 概率 ~30-40%

## 失败后退 (G10 候选)
- 选项 a: snake+db 混合 G9 / G10 (kick 异构化, 不限 weak revKick)
- 选项 b: snake 段长加大 + 反转中间一段 (试不同 5-cut 变体)
- 选项 c: or-opt-2 final-only (G5 全局失败, 仅 final 安全)
- 选项 d: 维持 G4 等下一轮 inspiration (cartographer 那边)

## 累积 lessons (G3-G9)
- G3: SA + or-opt 双变量被拒 (T0 未标定, +0.67%)
- G4: +or-opt-1 大成功 (-1.24%), ILS kick 池不变
- G5: or-opt-2 全局失败 (+0.31%), 2 段重定位 n=200 信号弱
- G6: FPS-4 起点失败 (-0.07%), 多起点饱和
- G7: revKick 异质失败 (+0.05%), 弱 kick 比 db 拖后腿
- G8: 加深 LS 失败 (-0.17%), 单变量深化已达 plateau
- G9 (in flight): snake 替代 db

## 单变量纪律
- G9 仍保留 G4 的 init / LS / final 全套, 只换 kick 函数。
- 失败时回退到 mixed kicks 或不同段长 snake, 不回到已被 G6/G7 淘汰的方向。