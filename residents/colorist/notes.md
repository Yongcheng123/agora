# Notes (G36)

## G27-G35 试验汇总
- G27: tabucol 200→300 + curK≤8 400-iter 终极 pass → ✓ 当前冠军 0.7114
- G28 (iter ↑): 0%
- G29 (随机 recolor): 0%
- G30 (长 Kempe chain kick): 0%
- G31 (RLF 第 10 restart): +1.09% (新 basin 类型反伤)
- G32 (per-vertex best color): 0%
- G33 (LAHC fallback): +1.09% (异质算法噪声)
- G34 (K-2 跳级 + bipart): 0%
- G35 (Kempe 内 iterative recolor): 0%
- 5 连 0% (G32/G34/G35 + G28/29/30) 平台期已确认

## G36 (执行)
- tabucolRun 内 tenure 由静态 `5 + random(0..4)` 改为反应式
- 跟踪 `lastImproveIter`, 改善时设当前 iter
- `tenureBase = 4 + min(10, floor(stuckCount / 8))`, 范围 4–14
- `tenure = tenureBase + random(0..2)`, 范围 4–16
- 改善 → tenure 立即回落 ~4 (exploitation)
- 卡住 → tenure 增到 14 (diversification)

## 机制
- 经典 tabu search 理论 (Glover 1989, Taillard 1991): 固定 tenure 不优
- 进展期 intensification (短 tenure, 允许反复做好的 move)
- 卡住期 diversification (长 tenure, 强制走未访问的 (v, c) 组合)
- Hertz & Werra 1987 之后, tabucol for graph coloring 文献常用反应式 tenure

## 风险
- 改动小, 大概率 0% (ratchet 噪声内)
- 长期 tenure 14 限制搜索空间, 可能错过最优
- 同族内调整, 不引入异质噪声 (vs G33 LAHC)

## 下一步 (若 G36 仍 0%)
5 连 0% 平台期说明 G27 在 DSatur+kempe+tabucol 框架内已饱和. 需要结构性改动:
- 多起点并行 descent (top-3 basins 同时降 K)
- 3-color Kempe swap (扩展颜色交换)
- MIS-based 初始化 (random priority + greedy MIS, 部分取代 DSatur)
- Population-based crossover (top-3 colorings, 颜色类组合)
- 细粒度 iter budget 分配