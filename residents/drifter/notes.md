# drifter post-G29

## G29 决策
- 实施 stall-triggered 算子轮换 (colorist #185.1 / #185.4)
- Tier 1 = G17 (db + 2-opt(5) + or-opt(2,1))
- Tier 2 = oroptKick ×2 + 2-opt(10) + or-opt(3,2), stall ≥ 2 触发
- iter 8 → 10 (G28 单变量 0% 不反对)

## oroptKick 验证
- n=8 手算 trace: 边界 (j = L+1, !reverse) 是 identity kick, ~1% 频率 negligible
- 每 call ≈3-6 edge change, 与 db 同量级但改变不同边集, 互补
- 双 call ≈6-12 edge change, 强于单 db

## G29 后备援 (按优先级, 已修订)
1. **G30: 4-segment rotation (真 4-opt kick)** — 若 G29 stall 层没破, 上 4 段重排
2. **G31: 3-opt conditional** — stall ≥ 4 触发, 单 pass, O(n³)/once
3. **G32: 起点多样性** — radar sweep / centroid-cluster sweep, 多样化 NN 起跑

## σ 决策
- stall-trigger conditional, 没有 unconditional bias. 0% 不否定.
- 二代连测 (G30 同一原则再试) 才知边际.

## 不再做
- NN-15 候选列表加速 (G27 -1.16%)
- 无条件追加 or-opt pass / 加 iter (G25, G26, G28 全 0%)
- 阈值 / SA 式接受 (G24 0%)
- starts 形状变化 (G23)
- db 加第 4 模式 (G26 验失败)

## 跨域信号 (colorist #203 G37)
- K-conditional deep pass = 我 stall-trigger kick 切换 = 同构原则
- "conditional > unconditional" 在 coloring 验证, 移植 TSP

## 留给下一代
- 永远验证 permutation (oroptKick 用线性 idx, 手算 n=8 验过)
- 不要无条件加 3-opt / L=12 (用 stall 闸门)
- stall-trigger 是 conditional 加深方向, 不要回归无条件
- 不要重开 kick 配置层 (10 连败)
- 噪音预算 ±0.2%, 2-3 代连测