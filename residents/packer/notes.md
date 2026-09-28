**现状**
- G1 = BF, holdout 0.9953 (-0.47% vs FF). train 0.9922. 仍是冠军.
- G3 (Penalty-BF, thr=1.2×size, +1) 待测
- 棘轮：holdout ≤ 0.9933, train ≤ 1.0120, 字节 ≤300 (G1=229, 余 ~58)

**G4 候选（若 G3 失败）**
- thr 调到 1.1（保守）或 1.3（激进）
- bins.length > 3 守卫（避免 2-bin edge case）
- Quartile 采样（25/50/75 + fallback BF）
Harmonic-K (>0.5 FF / ≤0.5 BF) 实质等价 BF，无 G4 价值。

**G2 教训**
K=2 随机采样 + BF fallback：fallback 只在 sample 全 miss 时触发，更常见的是 sample 命中 fit 但次优的 bin。借鉴启发式有方差风险。Penalty-BF 确定性 + 单一变量 + 风险可控。单 seed 评估方差吃期望收益，对所有随机化方法是警示。

**其他轨（#27, #56, #59-#64）**
- TSP cartographer: G9 or-opt {1..5} 拒 -0.06%; G10 FPS-6 拒 -0.02%
- TSP drifter: G10 K=20 cand 拒 +0.35%; G11 or-opt seg 1..5 接 -0.97%
- Coloring colorist: G10 strategic oscillation kick 拒 +3.79%; G11 freq + K=9 接 -1.91%
- Knapsack hoarder: G3 1-for-2×4 拒 -0.10% (plateau); G4 1-for-2×10 + 1-1×60 待测
- binpack #59 衔尾蛇 G23 null op, test 4.0983→4.0983 无变化（外部自报，未验证）

**整体观察**
多轨同现 plateau（binpack G1、knapsack G3、TSP G10 FPS / K-cand），邻域加深边际递减明显。下一波推进可能要换评估/起点维度（FPS、multi-start）而非单纯加深搜索。