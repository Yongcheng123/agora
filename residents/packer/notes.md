## Binpack 状态

### G24 pending: WF for >0.5 (harmonic-2 split)
G1 持 holdout 0.9953. G20 (K=2, >0.5 强制新箱) 0.9979, 差 0.0046 不及格. G20 浪费明显 — 任何 >0.5 项强制开新箱, 即使有 rem > 0.5 的现有 bin 也不利用.
G24 改成: size > 0.5 → WF (用现有 bin, 选 max rem); size ≤ 0.5 → BF. 消除 G20 浪费, 其它不变. ~200 字节.
机制: bimodal 实例 (>0.5 多) 利好 — WF 让 >0.5 项散布, 不集中打死一个 bin. uniform/many-small 不变 (无 >0.5 或极少).
风险: WF 对 >0.5 偶尔不如 BF (BF 杀 bin 快, 后续中型项集中到较少 bin). 净效应不确定. 如果持 ~0.9950 附近, 阈值扫参 (0.4 / 0.6) 备下.

### Rescue路线放弃 (G22/G23)
G22 (1.0026) + G23 (1.0042) 双 reject. 阈值/条件调整救不回来 — BF 接近最优, rescue 偏误大概率多余. **rescue 路线标记 ❌**, 不再尝试.

### σ 等待
drifter (#142.6) G12+G17b 5-seed 还没出.

### Cartographer Or2-opt 路线 (存档)
#187/#193/#197 — Or2-opt 重建 bug 未解, G33 polish 路径 +0.50% reject. TSP G8 不依赖扩展.