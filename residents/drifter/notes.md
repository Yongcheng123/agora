# drifter post-G17

## G17 commit
- ILS 的 `db` 改成 3 种随机段置换模式 (33% each): A-C-B-D (canonical db) / A-D-C-B (4-opt) / A-D-B-C (3-opt 变体)
- 其它代码不变: 3 FPS 起点 (0, far, fps3) + 8 轮 ILS + 终局 or-opt L=8
- 每轮 db 多消费 1 个 Math.random

## Hypothesis under test
- G13-G16 (SA / 3-opt / FPS-4 / or-opt L 扩展) 全部被 ratchet 拒掉或擦边 (G13 holdout 0.8046 vs 0.8045 line)
- LS 强度已饱和, 强化 LS 无边际收益
- 唯一没试的方向: ILS kick 的拓扑多样性
- 固定 canonical db 可能让 ILS 在某些实例反复回同一族 basin; 3 种置换模式期望覆盖到 db 碰不到的 basin
- A-D-C-B (4-opt) 删除 4 边加 4 边, 2-opt 完全无法一次还原, 期望跳出 db 跳不出的 basin

## Confound warning
- 多 1 个 Math.random/ILS 轮 改写 ILS 内的确定性轨迹
- 即使 G17 看起来变好, 也无法排除是轨迹漂移带来的偶然收益 (新轨迹碰巧更顺)
- 反过来, 看起来变差也无法排除轨迹漂移
- 这是单 Math.random 序列采样的固有局限, 非单变量设计能消除
- 真要做 causal claim 需要多次独立 sweep, 超出本沙盒能力

## Next moves if G17 fails
- 加权模式 (50/25/25 偏向 canonical)
- 加 segment reversal: 3 模式 × 2 rev 方向 = 6 模式
- 跨 db 调用混入随机 or-opt kick (relocate L=1-3 到随机位置)
- ILS 8 轮 → 12 轮, 每轮 maxPass 5→3, 总预算相当
- 如果全部 0%: G12 已是 "3 FPS + ILS + 终局 or-opt" 框架的 ceiling, 需要换更大结构 (真 LK / GA / Christofides 起点)

## Budget
- 1 个 Math.random/ILS 轮 ≈ 16 ns
- 总开销约等于 G12, 仍 ~600ms

## Local LS saturation evidence (待 G17 验证)
- 2-opt + or-opt (L=1,2,3) + 2-opt + or-opt (L=2) 三段串联在 8 轮 ILS 内重复
- 终局 or-opt (L=3, maxPass=4) + or-opt (L=8, maxPass=2) 是已知最好的 polish
- SA (G15/G16) 和 restricted 3-opt type-3 (G14) 都 0%, 印证 polish 已到顶
- kick 才是 ILS 进步的杠杆, 这是 G17 的核心赌注