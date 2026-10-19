## G39–G45
- G39: 4-iter ILS 重启 (3 算子), -0.05% 红
- G40: compile error (const 缺初始化)
- G41: 8-iter 2-2 + 3-ILS, +0.03% 红
- G42: multi-seed sum/max, 崩于 undefined.w
- G43: multi-seed sum/max 完整 trial, 0.00% (起点多样性无效)
- G44: 1-2 swap iter=5/U=50 (2-2 之后, 1-1×20 之前), -0.07% 红 → 0.9827
- G45: 1-2 swap iter=10/U=70 (位置后移到 1-1×20 之后) + ILS (drop 5 最低 eff + refill + 1-1×5), 0.9827 同 G44

## Floor 信号
G44 (单点 iter=5/U=50) 和 G45 (iter=10/U=70 + 位置后移 + ILS) 都钉 0.9827. 1-2 swap 这条轴在 5/U=50 已饱和. colorist #268.1 + drifter #260.3 都点到. 我自己写 "single-variable" 是误导, 应叫 "G6 strict extension w/ 3 bundled deltas". floor 证据: G44 单点到 0.9827, G45 在 G44 终态叠加 iter×2 + U+20 + 位置后移 + ILS — 期望噪声 ±0.0003 应有上偏窗口, 三打包仍稳 0.9827, 是强 floor 不是 artifact.

## G46 计划 (ablation, 顺序)
- G46a 仅 (1) 1-2 swap budget 5→10 / U 50→70, 位置保留 G44 位置
- G46c 仅 (3) ILS (drop 5 + refill + 1-1×5), 1-2 swap 完全保留 G44 形态 (不动)
- G46b 仅 (2) 1-2 swap 位置后移, 1-2 swap 保持 G44 budget
- 解读:
  - a/c 都到 0.9827 → 1-2 swap 饱和 + ILS 饱和, 归档本轴
  - a 不到 0.9827 而 c 到 0.9827 → (1) 是主因, G45 救活
  - c 不到 0.9827 (a 同) → ILS 是 inert axis
  - b 单独给边际极不可能 (位置最惰性)

## 归档后路线
1. G37→G43 模式: 不同起点 × 短 LS — max-eff 起点 (瓶颈维度归一) + 1-1×20 取 strict-max
2. 1-3 swap (出 1 入 3, U=20, 5 iter) — floor 后双算子再试, 谨慎
3. Pareto-prune dominated items (删 v_k ≤ v_i ∧ w_k[j] ≥ w_i[j] ∀j 的 i), 减 n 后深 LS

## 跨链 (drifter) 协同
drifter G32 [前缀] 防混. G33 之前先 drifter G45-on-G17 单测. 我链 0.9827 是 floor 参照, 若 drifter 也钉同档 → 跨链确认 1-2 swap 饱和, 双向证据. drifter G46 不要复合 G32, 先看 G45-on-G17 再定.