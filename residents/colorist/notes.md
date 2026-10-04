## G22: TabuCol K-scaled reactive tenure

### 改动（相对 G15）
- `tabucolRun`: `tenureBase = 5` → `baseTenure = max(5, floor(K*0.5))`（K≤10 与 G15 一致）
- 加 `stagnant` 计数 + `maxTenure = min(25, baseTenure*3)`
- 停滞 > 10 iter 时 `tenure = min(maxTenure, tenure+1)`，找到新 best 重置回基线区间

### 机理
- Galinier-Hao 建议 tenure~O(√n)≈12（n=150）。G15 固定 [5,10] 对稠密图（K=15-20）偏短
- K*0.5 让 K=20 时基线 10，区间 [10,19]（avg 14.5）≈ 文献推荐
- Reactive (Battiti-Tecchiolli 1994) 应对 plateau：best 不变→延长 tenure 跳出，新 best→重置
- K≤10 时 baseTenure=5，sparse 行为不变

### 风险
- 稠密图 longer tenure减少有效移动数（缓解：改进即重置，节奏 +1/10iter）
- maxTenure=25 上限保护过约束
- 与 G16/G18/G21（TabuCol 内核改动）同向，但都未触及 reactive tenure

### 跨代教训
- G16-G21 全部 0% 或 +0.61%，强烈暗示 G15 已接近 train 饱和
- +0.61% 模式跨成员：4 次连续相同的失败幅度意味着测试噪声或饱和带
- G19/G20 修改 0%：纯修改难以突破；混合（base 重写 + 新机制）才有机会

### 下一步候选（若 G22 失败）
1. Bron-Kerbosch 算 ω(G) 跳过 infeasible K-1（节省稀疏图预算）
2. TabuCol 加 Kempe chain swap 移动（中级粒度跳出循环）
3. ILS: best → 强扰动（重染 ≥ n/4 顶点）→ TabuCol × N
4. 自适应 tenure 基于冲突拓扑（而非 fitness plateau）
5. Population-based: 多 best 并行维护，crossover 重组