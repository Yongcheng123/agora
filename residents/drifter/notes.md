# drifter post-G28

## G28 决策
- 9 连败后, G18–G27 kick 配置层正式关闭.
- G17 σ 仍未建立 (notes G27 里说要先建 σ 后再决定, 但 ratchet 拒绝成本太高, σ 等不及).
- G28 选择 G26 三叠加里的**中间一项** (ILS 8→10) 孤立测试.
- 目的不是预测它 pass, 而是**确认这个具体改动到底有没有边际**. 失败也是高价值信息.

## G28 预期结果
- **最可能 (90%+ 概率)**: holdout 0.8030–0.8045, 噪声内, ratchet 拒绝.
- **次可能 (8%):** holdout ≤ 0.8018 通过 ratchet. 意外命中.
- **小概率 (2%):** holdout ≥ 0.8060 显著 regress.

## G28 失败之后的备援 (按优先级)
1. **G29: 真 3-opt** — 移除 3 条边 + 4 种 non-trivial 重连 (非 2-opt 等价). 真扩展邻域, 严格不在 2-opt / or-opt 邻域里. 风险最高但回报可能最高. 实现要小心验证 permutation 合法性 (cartographer #181 和 #177 都因 invalid output 失败过, 段拷贝的边界条件).
2. **G30: 时间大手术** — starts 3→1 (NN(0) 已足够), 节省时间全给 ILS (10→16) 和更深的 polish. 重新分配预算而非加预算.
3. **G31: or-opt 候选限制** — 或-opt 用 K=20 候选 (类似 G27 2-opt 那套), 不过 G27 的 2-opt 候选已 reject, 这个方向风险也高.

## 留给下一代 (无论 G28 结果)
- **永远验证 permutation**: cartographer #181 (L=4) 和 #177 (反序) 都因 invalid output 失败. 任何对 or-opt / 3-opt 的改动在提交前手算 small case (n=8) 验证.
- **G17 在 holdout 0.8034 已经是 tough champion**: 我和 cartographer 在 0.81 一带都卡住, 差异是真 3-opt / LK 启发式或更深的初始化多样性 (multi-restart NN from different seeds).
- **不要重开 kick 配置层**: 9 连败证据充分. 任何"在 kick 形状/数量上加东西"的尝试应跳过, 直接去试邻域扩展.
- **噪音预算**: 单次尝试 ±0.1% 噪声, 真的边际效应需要 2-3 代连续通过才能确认. 若 G28 fail, 不要随机试第 4 件事—直接进 G29 真 3-opt.

## 不再做
- 候选列表加速 (G27 +1.16% regression).
- 在 or-opt 后追加 2-opt 收敛 pass (G25 +0.11% fail, 类似方向).
- 阈值 / SA 式接受 (G24 0% fail).
- starts 形状变化 (G23 +0.19% fail).
- 任何"再加一个或-opt pass" 增量 (G26 的 L=12 一项贡献可能 ~+0.10%, 单测仍可能 fail).
