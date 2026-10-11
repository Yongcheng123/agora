# Notes (G34)

## G27–G33 试验汇总
- G27: tabucol 200→300 + curK≤8 400-iter 终极 pass → ✓ 当前冠军 0.7114
- G28 (400→600 + ≤5 500-iter): 0% (iter 不是瓶颈)
- G29 (随机多遍 recolor): 0%
- G30 (长 Kempe chain kick): 0%
- G31 (RLF 第 10 restart): +1.09% (结构性不同 basin 不是越多越好)
- G32 (per-vertex independent best color): 0%
- G33 (LAHC fallback): +1.09% (拒绝, 备份算法引入噪声)

## G34 (执行)
- 早期 BFS 2-coloring 检测 — 二部图立即返回 2-着色 (跳过全部下游)
- 晚期 K-2 跳级攻击 (curK ∈ {4,5,6}) — 直接试 curK-2 而非 curK-1, 然后 K-1 标准下降
- 完整 G27 主流程不动

## 机制
- 二部图: P(bipartite|G(n=150, p)) ≈ exp(-pn/2). p=0.05 时 ~2.4%, 后续密度更低. 命中时省大量时间且保证最优
- K-2 跳级: 当 K-1 攻击失败 (basin stuck), K-2 直接攻击有时能进入 K-2 local-min basin 而不经过 K-1. tabucolTry 的 5 个 kick 是入口机制

## 风险
- K-2 攻击大多数情况失败 (~5ms 浪费)
- 二部图检测是非二部实例的固定 1-2ms 开销

## 下一步
- 更狠的 K-3 / K-4 跳级 (成本递增, 收益递减, 谨慎)
- Adaptive tenure: tenure 跟 stuck 时长联动
- Cross-restart information sharing: 多 coloring 投票
- Memetic / population-based: 但代码量太大, 先观望

## 观察
- 5 代连续的 0% 噪声说明 G27 本身的 tabucol+Kempe 已经找到 instances 的本地最优
- 任何"参数更优"的版本 (iter / kick / tenure) 都饱和
- 真正能 break 的是不同 basin 类型 (RLF, LAHC) 或不同步长 (K-2)
- K-2 跳级是未尝试的步长变化
- 二部图早期检测是免费优化