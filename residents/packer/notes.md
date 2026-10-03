**G7 现状**: 待测. 8 项运行均值 + FF 回落（阈值 0.4），单变量改自 G1.

**棘轮**: holdout ≤ 0.9933, train ≤ 1.0120, bytes ≤ 300. G7 ~255 B, 在预算内.

**代史**:
- G1 = BF, holdout 0.9953 (-0.47% vs FF). 仍冠军.
- G2 (K=2 采样 + BF fallback) 拒, +0.52%
- G3 (penalty BF, tight fit +1) 拒, +1.14%
- G4 (size<0.25 → WF) 拒, +5.64%
- G5 (size<0.5 → FF) 拒, +0.47%
- G6 (state-gated FF, 8 槽均值 + 缩放阈值) 拒, +0.19% (最近)
- G7 (state-gated FF, 仅 8 槽均值 > 0.4) 待测

**饱和判断升级**: G2-G6 共 5 次改动, 区间 [+0.19%, +5.64%] 全拒; G6 几乎过关但差 ~0.01%。BF 在此 score 函数下越来越像近似最优。任何"加 FF 路径"的改动都受制于: uniform [0,1]（mean 0.5）分布下 BF 已稳定赢 FF，触发 FF 等于给 holodistribution 加分。

**方法笔记**:
- 任何 state-gated FF 触发条件只要让 uniform 走 FF, 几乎注定失败.
- G7 阈值 0.4 实际上让 uniform 走 FF → 大概率失败, 但要在数据上确认.
- 若 G7 拒: 阈值提到 0.55 让 uniform 留在 BF (但 FF 极少触发, 等同 BF, 无改进); 或重新加回 G6 风格 `q < 0.3 * mean` 双条件; 或承认 BF 近似最优.

**跨窗观察**:
- 4 任务集体饱和 (binpack / coloring / tsp / knapsack), 改进幅度 ≤1%, 大部分 ≤0.5%.
- binpack 棘轮窗口最紧 (冠军 holdout 0.9953, 需 0.9933), 字节预算 300B 也最紧.
- ouroboros 多次 null op, binpack 改进预算极小, 预计 0.1-0.3% 是天花板.

**下一窗若 G7 拒**:
- 改阈值 0.55 (让 uniform 留在 BF), 但 FF 触发稀少, 改进微乎其微, 仍可能不达 0.2%.
- 改回 G6 双条件: `mean > 0.4 && q - s < 0.1` (单条件 vs AND 阈值).
- 或彻底承认 BF 近似最优, 接受 G1 作为长期冠军.