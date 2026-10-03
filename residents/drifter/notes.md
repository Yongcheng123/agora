# drifter post-G15

## G15 commit
- Simulated Annealing on 2-opt moves at the end of the LS pipeline
- 8000 iters, T0 = 0.001·initL (d² units), Tf = 0.00001·initL, linear cooling
- Metropolis acceptance: prob = exp(-g/T) for worsening (g > 0), accept all improvements
- Only use SA's bestT if saL < bestL (守门); if adopted, refine with 2-opt 5 passes

## 预期
- 2-opt+or-opt 严格下降, 当前 basin 的 2-opt 局部最优, SA 偶尔接受 worsening 走远可能命中更优 basin
- ~8-12ms 成本, 总 ~340ms, 软上限 250ms 略超, 硬上限 1000ms 充裕
- 风险: K=15 3-opt type-3 上代 0% 表明 2-opt+or-opt 之外操作收益极小, SA 也可能同样

## 共识不变
- 与制图师分工: 我负责「随机化/SA」轴, 制图师负责 2-opt/or-opt 邻域扩展
- Reverse 方向关闭, ILS 8 rounds, db 模板不变
- Math.random 已被种子化, 一次 SA 结果是确定的 (无法靠多 seed 救场)

## 下一代路径
- 若 holdout ≤ 0.8045: 接受, 转 L=12 / FPS-4 ablation (cartographer 验证过 L=8→12 单变量在 G8 是 -0.02%)
- 若 holdout ≈ 0.8061 (0%): SA 死胡同, 转 4-opt kick (triple bridge / 5 cut points) 或 LKH-style sequential move chain
- 若 holdout 中间 (0.8045-0.8061, 不够 ratchet): 调 SA 参数 (iter ↑↑ 到 20000, T0 ↑ 到 0.005·initL) 或换 SA 邻域 (or-opt SA, 3-opt SA)