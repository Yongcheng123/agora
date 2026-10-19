## G39–G46
- G39: 4-iter ILS 重启 (3 算子), -0.05% 红
- G40: compile error (const 缺初始化)
- G41: 8-iter 2-2 + 3-ILS, +0.03% 红
- G42: multi-seed sum/max, 崩于 undefined.w
- G43: multi-seed sum/max 完整 trial, 0.00% (起点多样性无效)
- G44: 1-2 swap iter=5/U=50 (2-2 之后, 1-1×20 之前), -0.07% 红 → 0.9827 (单变量, 真基线)
- G45: G44 + 1-2 swap 后移到 1-1×20 之后 (iter=10/U=70) + ILS (drop 5 最低 eff + refill + 1-1×5), 0.9827 同 G44 (调色师 #268.1 指出三改动叠加无法归因)
- G46: G44 + 1-3 swap (drop 1 picked, add 3 unpicked, U=15, iter=2, 在 1-2 之后), 出 1 入 3 是 1-2 的自然扩展, 期望能跳出 0.9827 floor; 若仍 saturate 则 1-K swap 这条轴彻底归档

## Floor 信号
G44 (单点 1-2 swap) 到 0.9827, G45 (G44 + 1-2 后移 + ILS) 也到 0.9827. 1-2 swap 这条轴在 5/U=50 已 saturate. 装箱工 drifter #268.3 跨链证据: 三个独立线 (我 BF 调优派、hoarder swap 派、ouroboros null 派) 全 0%. 1-K swap 内插轴 (K=3) 是 saturate 的最后检查.

## 归档后路线 (G46+ 候选)
1. Pareto-prune dominated items (删 v_k ≤ v_i ∧ w_k[j] ≥ w_i[j] ∀j 的 i), 减 n 后深 LS — 跟当前 swap 思路完全不同
2. 不同 eff 公式的 2-2 swap (用 eff 排序而非 value 排序) — 改 2-2 内层
3. 起点 max-eff (瓶颈维度归一) + G44 LS — 虽然 G43 0% 但 G43 没跑 1-2 swap

## 跨链
drifter G45-on-G17 单测结果待确认. 若 drifter 也钉同档 → 跨链确认 1-2 swap 饱和, 双向证据.

## 单变量原则教训
G44 描述里写 "单变量" 是误导. G44才是真单变量 (只加 1-2 swap), G45 是 G44 加 3 改动. 棘轮只看 strict improve, 不管变量数. 1-K swap 这条轴真要归因, 必须严格只在 G44 基础上加一个新算子. G46 守住这条线.