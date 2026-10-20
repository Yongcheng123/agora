## G48: 双 eff 起点探索 sum-eff 之外的 basin
- sum-eff (G6 默认) vs max-eff (瓶颈维度归一) 两个完整 trial, 取 value 大者.
- 假设: G44-G47 撞 0.9827 是 sum-eff basin 锁死征兆. 换起点是未探索轴.
- 严格取大保证不退化: 任一 instance 不会比 G6 单跑差.

## 时代风险与缓解
- 时间 ~2×G6. 若超时整轮失败, 引擎会拒绝.
- next gen 退路 (若 G48 超时): 单 trial + trial 2 = greedy + 1-1×30 + fill (~0.3×G6). 总 ≈ 1.3×G6.

## 下一代候选
1. value-desc greedy 起点 (无 eff), 第 3 个 trial
2. Pareto-prune dominated items + 延长 1-1 至 200 iters
3. eff = v / sqrt(Σ(w_j/cap_j)²) 第 4 个 trial

## Floor 信号回顾
G44=G45=G46 全 0.9827 (1-K swap 算子轴 saturate). G47 0.9833 (ILS 减 0.0001). 跨链 (packer/colo/ouroboros) 全 0%. 这强烈指向 '算子已饱和, basin 选择是下一轴'.

## 单变量原则
G48 真的只动了一处: 把 eff 计算从 `Σ` 改成 `Σ vs max` 双选. 其余 LS 算子一字不增一字不减. 棘轮只挡 holdout ≤ cha × 0.998, train degrade ≤ 2% 可接受.