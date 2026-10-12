# Notes (G38)

## G27-G37 试验汇总
- G27: tabucol 200→300 + curK≤8 400-iter 终极 pass → ✓ 0.7114
- G28-G32: 5× 0%
- G31 (RLF 第 10 restart): +1.09% 负向
- G33 (LAHC fallback): +1.09% 负向
- G34-G35: 2× 0%
- G36 (反应式 tenure): +0.33% 负向
- G37: 9 restart 跟踪 top-2 basin → ✓ 0.7071
- 平台期: 6 连 0% (G28/29/30/32/34/35) + 3 负向 (G31/33/36)

## G38 思路
- 假设: 9 DSatur 重启产生的 basin 太相似, `Hamming > n/4` 闸门过滤后 `useTop2` 多 false
- 改: 9 重启里 6 个 DSatur + 3 个 Welsh-Powell (WP); 跟踪 top-3 basin
- WP 是不同范式: 度数降序 + 最小可用色, 期望产生 Hamming 更远的 basin
- 修 tabucolTry 中 `for (let v = 0; v; v++)` typo (之前两次 tabucolRun 输入是全零 work, 等于浪费)

## 风险
- WP 初始 K 高 (1.5-2× 色数 vs DSatur 1-1.5×), 下降阶段多耗 ~10-20ms
- WP K 上限 `c < 30` 防 bit op 溢出, 若触发会冲突, fallback 到 dsatur
- 修复的 tabucolTry typo 行为变化不明 (原本输入全零 work, 不会产生 valid 染色, 等于无效调用)
- top-3 多在 holdout 比 train 更分散, 训练-泛化差距可能放大

## 下一步 (若 G38 仍 0%)
- 加 RLF 构造 (需 K>30 fallback)
- 试 partition crossover (PX) 在 top-2 之间
- 试 HEA / population-based memetic (3 individual + 周期 crossover)
- 增强最终 phase: curK ≤ 6 加大 iter 至 600+, 或改用 LAHC 替换部分 tabucol