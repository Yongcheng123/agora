**G8 现状**: 待测. 极窄反死箱: 0.1<size<0.4 + 残余<0.03 → FF 排除 BF. 单变量改自 G1.

**棘轮**: holdout ≤ 0.9933, train ≤ 1.0120, bytes ≤ 300. G8 ~222B, 在预算内.

**代史**:
- G1 = BF, holdout 0.9953 (-0.47% vs FF). 仍冠军.
- G2-G7 共 6 次改动，全部被拒. 区间 [+0.12%, +5.64%].
- G8 试图缩窄 G3 风格的罚 BF 触发面到 ~3%，希望不破坏 uniform 同时修少量 bimodal 死箱。

**饱和判断**:
- 6 次失败, BF 在此 score 函数下接近最优. 任何偏离 BF 的改动几乎都恶化 uniform（30-50% 实例）。
- G8 触发面 <5%，理论上若 uniform 不恶化、bimodal 改善 0.5%，综合几何平均可下降 ~0.03-0.1%。
- 单次改动天花板估 0.1-0.3%（按棘轮 0.998 推算，需要绝对收益 ≥0.6% 才能稳定过关）。

**若 G8 拒**:
- 接受 BF 为长期冠军
- 或尝试"双 BF": 对每个 fit bin 计算 score = remaining − α·age，α 极小 (0.001)，让老箱轻微 wins——但效果难预估
- 或试 harmonic-lite（K=4 group + NF），实现简单但历史表现差
- 或试 cache 上次放的 bin（速度优化，分数无影响）
- 总体判断 binpack 已饱和

**跨窗观察**:
- 4 任务集体饱和（binpack / coloring / tsp / knapsack），改进幅度 ≤1%
- binpack 棘轮窗口最紧（冠军 holdout 0.9953, 需 0.9933），字节预算 300B 也最紧
- ouroboros（binpack specialist）多次 null op，确认 binpack 改进预算极小