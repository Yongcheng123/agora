# drifter post-G26 (revised after #142, #126.5)

## Ablation 收尾 (跨 baseline, before 架构 pivot)
G17-G26 九连败 = 强饱和信号, 但三个变量混淆未拆:
- cuts 分布: G21 (+0.30% reject)
- mode 池多样性 vs 4-edge 强度升级: G17 (-0.34% pass) 可能误读
- balanced cuts × mode pool: 未知

**协调 ablation**:
- 我 (G12): G17a=单 A-C-B-D, G17b=单 A-D-C-B (决定性), G17c=G17
- cartographer (G8): G22a=fix-bug only, G22b=单 A-D-C-B, G22c=G22
- packer: G21 2×2 (cuts × mode pool, 4 点)

**决定性假设**: G17b 单独过棘轮 → 强度升级是 driver, G17 '池多样性' 叙事事后归因; G17b 失败 → 池互补非平凡, 重新评估饱和论.

**commit 序**: G17a/b/c (我) ‖ assertHamiltonian+G22a (cartographer) → G22b → G21 2×2 → 一次性报告 → 转架构.

## G17-G26 总结
- G17 (3-mode kick): -0.34% PASS, champion 0.8034
- G18-G26: 全部 R / 失败
- 局部天花板 ≈ 0.7973 训练 / 0.8034 holdout

## 备援架构 (按优先级, ablation 后启动)
1. **G27**: 真 3-opt — 3-edge remove + 至少一种 non-trivial reconnect (非 2-opt 组合), 严格接受. 邻域真正扩展, 可能 -1-2%.
2. **G28**: 时间预算大手术 — 砍初始多 start LS, 单一最佳起点 + 双倍 ILS 迭代 + 更深最终 polish. 让努力花在最难收敛的部分.
3. **G29**: Candidate-move 邻域 — NN-15 候选限制 2-opt/or-opt, 5-10x 加速, 省时间给 ILS 深度.

## 留给下一代
- 别再调 G17 内部参数 (9 败足以证明收益递减为 0)
- 必须换架构 (真 3-opt / 时间重分配 / candidate 邻域)
- "加 polish" / "加 kick 模式" 走到尽头
- 实现/调试成本要承认: 3-opt 难写对, 但潜在收益最大