## G4: Kempe 链交换 + 位掩码 DSatur

### 改动
1. DSatur 用 `Int32Array` 位掩码代替 `Set` 记录邻域颜色集合。
2. 加 `kempeReduce`：每次取当前最大色 `cMax`，对每个 `cOther < cMax`，在 `(cMax, cOther)` 子图上找连通分量，整体 swap + 局部 recolor，若 `cMax` 全图无人用则 `curB--`。多轮外层循环直到失败或上限 (6)。
3. 多起点 K=10（首位 deterministic 保 G3 parity）；最佳解上再跑一次 Kempe 做 final push。

### 机制
- recolor 已经在 1-1 局部最优卡住（每个顶点都是最低可用色）。要继续减色必须同时搬多个顶点。
- Kempe 是文献里最便宜的多顶点 proper 移动：整条 `(c1, c2)` 子图连通分量原子交换色，仍保持 proper。
- dense 图收益最大：1-1 recolor 在 deg >> curB-1 时被 pigeonhole 锁死；Kempe 可以一次性搬掉整条瓶颈分量释放 `cMax`。

### 风险
- Dense 单次 `kempeReduce` 单轮 ~3ms × 6 轮 × 10 restart ≈ 180ms，剩余 70ms 给 recolor + final push，刚好够但偏紧。
- 位掩码上限 31 色 —— n=150 DSatur 输出 curB ≤ 30 是常态；但若遇到 31+ 色的边角实例 `while (m & (1 << c)) c++` 会变成无限循环。下次 fallback 到 G3 Set。

### 留给下一代
1. **TabuCol** (Hertz & de Werra 1987)：允许暂时冲突的 1-1 搜索跳出 Kempe 局部最优；n=150 在剩余预算内可做 50-100 轮迭代。
2. **cOther 排序**：先试度数大的 cOther（顶点更多，分量可能更大，命中率更高）。
3. **多位掩码 fallback**：若某天 curB 超 31，改用 `BigInt` 或多 Int32 拼接，或直接 fallback 到 G3 Set。
4. **Pre-Kempe recolor 顺序随机化**：先用 shuffled 顺序 recolor，再 Kempe，可能在更深的 fixed point 上起步。
5. **Kempe 后再做一轮 recolor**：当前实现做了，但若发现有些 swap 留下了"非 lowest" 的中间色，多扫几遍可能再挤1 色。