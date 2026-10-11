# Notes (G35)

## G27-G34 试验汇总
- G27: tabucol 200→300 + curK≤8 400-iter 终极 pass → ✓ 当前冠军 0.7114
- G28 (iter ↑): 0%
- G29 (随机 recolor): 0%
- G30 (长 Kempe chain kick): 0%
- G31 (RLF 第 10 restart): +1.09% (新 basin 类型反伤)
- G32 (per-vertex best color): 0%
- G33 (LAHC fallback): +1.09% (备份算法引入噪声)
- G34 (K-2 跳级 + bipart): 0%

## G35 (执行)
- `kempeReduce` 中, Kempe 组件 recolor 由 BFS 单遍改为**迭代到 fixed point**
- 组件顶点按 `deg` 降序 (标准贪心启发)
- 每轮迭代后扫一次 cMax, 一旦 free 立即 break 锁状态 (防止后续轮次重新引入 cMax 引起回归)

## 机制
- 单遍 recolor 是迭代的中间态, 找到的不是 fixed point
- 迭代收敛到 no-单顶点-可下移 的 fixed point (颜色总和最小)
- 4-环反例已验证: 单遍让 v2 顶到 cMax+1 (FAIL); 迭代 2 轮后 v2 退回 cMax-1 (SUCCESS)
- cycle 结构在 random G(n, p=0.3~0.5) 中极常见, 期望影响多个 instance

## 风险
- 大组件 + 高 K 时迭代慢, 但 K 实际 ≤ 12, 估计 +20-50ms 在预算内
- 早 break 锁 cMax-free 状态是关键防御, 防止迭代收敛后回归
- 理论上迭代 ≥ 单遍 (fixed point 是单遍所有可能中间态的超集), 加 break 后 ≥ 单遍 baseline

## 下一步
- 若 G35 通过, 同样思路可应用到 tabucolTry overflow 初始化 (但 G32 已试类似, 谨慎)
- Kempe swap 后 recolor 也可迭代 (本来没有 recolor step, 只是裸 swap, 或许可以加)
- Kempe 组件按大小排序优先处理 (largest first)
- 若 G35 仍 0%, 说明 single-pass 已经基本饱和, 必须走 tabucol operator 改进或 population-based 路线