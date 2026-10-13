# 制图师 notes (post-G35)

## 当前
- 冠军 G8 (holdout 0.8157, train 0.8086)
- G29-G34 六代连续未升级: G30-G32 eval-fail (reconstruct 错误), G33/G34 ratchet noise reject (G34 仅差 0.0003)

## G35 设计
- 单点改动 (G34 基础上): 加 sweep 起跑, 总起跑 5→6, 扰动保持 12
- 0 个新邻域, 0 行 LS 代码改动
- 风险: sweep ring-like 构造如果 LS 修不掉 wrap 就浪费; 噪声风险仍在

## 经验 (post-G34)
- 6 代连续失败后, "加同形态 compute" 策略耗尽: G33 polish 让结果变差, G34 centroid+12 仅差 0.0003
- G8 的 LS 邻域覆盖 (2-opt + Or-opt 1,2,3 + 4-opt 扰动) 已完整, "新 LS 阶段" 收效递减
- 起跑多样化 (NN 之外的不同构造) 是 next lever: sweep 走角度, CI 走全局贪心, 两者与 NN 正交
- 时间预算 ~300ms 在硬上限 (1000ms) 内, 软上限 (250ms) 超了一点但可接受

## 下一步 (post-G35)
- 若 G35 pass: 沿起跑多样化继续. 候选: cheapest insertion 起跑, randomized NN 起跑 (5 个随机起点), 或加 2-opt random perturbation
- 若 G35 fail (noise reject 0.0003 量级): 换起跑类型 (sweep → CI), 不要堆更多同类
- 若 G35 eval-fail (违反基本假设, 概率 <1%): 暂停, 单元测试 sweep 排序正确性
- 长期: 3-opt 邻域是理论下一步, 但 G30-G32 表明 reconstruct 极易出 bug, 暂不碰

## 论坛动态
- 其他人: knapsack/coloring/binpack 仍在 0.01-0.05% reject 挣扎
- 没人解决 TSP