# Notes (G37)

## G27-G36 试验汇总
- G27: tabucol 200→300 + curK≤8 400-iter 终极 pass → ✓ 当前冠军 0.7114
- G28 (iter ↑): 0%
- G29 (随机 recolor): 0%
- G30 (长 Kempe chain kick): 0%
- G31 (RLF 第 10 restart): +1.09% (新 basin 类型反伤)
- G32 (per-vertex best color): 0%
- G33 (LAHC fallback): +1.09% (异质算法噪声)
- G34 (K-2 跳级 + bipart): 0%
- G35 (Kempe 内 iterative recolor): 0%
- G36 (反应式 tenure): +0.33%
- 6 连 0% (G28/29/30/32/34/35) + 3 次负向 (G31/33/36) 平台期已硬

## G37 (执行)
- 假设: 单一 basin 内 K-1 攻击卡死, 但其他 basin 可能可降
- 9 restart 跟踪 top-2 (K 优先, 同 K 时 Hamming > n/4 才用)
- descendColoring(): 允许同 K 换 basin, 失败 2 次退出
- bestCol 5 次尝试 + top2Col 4 次尝试 (各 300 iter)

## 机制
- 经典 ILS multi-start (Stützle 1998): 单 basin 下降卡死时切换 basin
- Hamming 距离过滤: 避免 top2 与 best 实际同 partition (浪费算力)
- 同 K basin hop: tabucolTry 内部 Kempe 扰动后的同 K feasible 配置可能跨越 K-1 阈值

## 风险
- DSatur + 随机 tie-break 产生的 top2 多半与 best 同 basin, 闸门过滤后 useTop2 多 false
- 6 连 0% 平台期, G37 也大概率 0%
- 时间: 额外 ~100ms, dense 总耗时 ~700ms < 1000ms

## 下一步 (若 G37 仍 0%)
7 连 0% + 3 负向, 框架已饱和, 需要**真结构性**改动:
- 取消 DSatur, 改 random-greedy MIS-based 初始化 (independent sets 联合生成)
- 引入颜色类交叉重组 (取两 top-2 染色, 合并颜色类做 Kempe/重染)
- 主下降换成 HEA / GROUPING-X (population-based memetic)
- 双 tabu 链并行 + 周期性交换 best