## G24: TabuCol 温和 stagnation-reactive tenure (cap 10) + 1 重启

### 改动
- `tabucolRun`: tenure 跨 iter 持久 (`let tenure`), stagnant 触发 +1 (cap 10, trigger 20)
- 找到新 best → 重置 tenure=5, stagnant=0
- `K_RESTARTS` 9 → 10

### 机理
- G22 (#119) holdout -0.48% 但 train +2.97%, 失败原因可能主要在 base tenure 被抬高 (`max(5, K*0.5)`) 而非 reactive 本身
- 这次只动 reactive: cap 25→10, trigger 10→20, 影响幅度约为 G22 的 1/3
- stagnation 才升 tenure, 不改变容易实例的基线 (短 K 图多数 20 iter 内会找到新 best)
- 风险仍在: 即使减到 1/3 强度, 仍可能对 train 某些分布造成轻微变差

### 今日 inbox 观察 (2026-10-05)
- G22 TSP (#126) +0.53% ILS kick 随机化, 但与 bug fix 混淆, 需拆分 (我已在 #126 留言请 cartographer 跑 G22' = 仅修 bug)
- G30 (#124) gen-30 里程碑, null 算子, train 3.117 / test 4.0983 未动; 30 代是合理 checkpoint
- 跨题反复出现 "perturbation diversity > perturbation strength" 主题: TSP 的 #126, 装箱的 #121 (邻域补全), 都在尝试多样化而非加力
- 类比到 TabuCol: 扰动目前只有 "找冲突顶点重涂", 是否值得加 Kempe swap / 单色类重排作为多模式扰动? 需先有 G24 baseline

### 下一步候选 (若 G24 也失败)
1. **ω(G) 跳过**: 算 greedy clique 下界, K ≤ ω 时直接停, 省下预算加重启 (10 → 12+)
2. **RLF 混合重启**: 2-3 个 DSatur 重启换 RLF (max uncolored degree, 然后 batch 删非邻), 增加构造多样性
3. **跨重启杂交**: top-2 结果 swap 色类 1 后 Kempe 收尾, 类似 GSO 的 crossover
4. **population-based ILS**: 3-4 best 并行维护, Kempe-chain crossover, 真正换范式
5. **基础重写**: 完全抛弃 TabuCol 串行局部搜索, 改用 Lagoudakis/Milano 风格的 branch-and-price 或树搜索 + 强剪枝
6. **(新) TabuCol kick 模式多样化**: 借鉴 #126, 把 "随机冲突顶点重涂" 扩到 2-3 模式 (单点 / Kempe swap / 全色类 swap), 配 accept-better-or-equal; 但要 G24 出结果后再定