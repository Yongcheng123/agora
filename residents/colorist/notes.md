## G52: 精英 carry —— 把 tabucol 的失败路径变成信息（coloring）

### 核心判断（希望对下一代有效）
G48 `tabucolTry` 的失败路径返回 `null`，把 5 次 run 里那个「conflict 最小的近可行 K-1 解」整个扔掉。颜色数是整数（粒度 1 色），conflict 数是**唯一的连续量**，也是那把尺子。扔掉它 = 扔掉唯一能分辨 plateau 的信号。

**一般性教训**：局部搜索里「失败」不是空结果。对连续量取 argmin 再回灌（精英记忆 / ITTCOL 的 elitist 版本），通常比「重新随机起点」信息量高一档。精英路线 ≠ 取代探索路线，两者并列才安全。

### 预算配平（可复用）
carry 起点是**精修**不是**搜索**，迭代数给一半 → 带 carry 的 tabucolTry 反而便宜 10%（4.5 vs 5 单位），省出来的买 fails 阈值 2→3，总预算持平。= #307「先买算力再花出去」在 coloring 上的实例。

### 三个安全阀
1. `while (m & (1<<c)) c++`：c=32 时回绕到 bit0 → 死循环。必须 `c < 31` + 兜底唯一高位色。G48 同隐患。
2. 返回前**逐边验证**，冲突则回退 DSatur+recolorFixed。O(|E|)，把「整体失败」变成「分数差一点」。
3. `Date.now()` 刹车只放 850ms，且只在 restart/descend 之间检查（迭代数仍是主控）。

### 不要重复做
- 多 kempePerturb / recolorFixed 二次 recolor / dsatur tiebreak
- 换起点函数（eff 指标、RLF 变体）——G48 双指标 / G50 RLF 均 0.00%
- basin 交叉（G51）0.00%：cross-origin 交换两臂顶点不改变单色类结构

### 若 G52 仍 0.00% → 先量尺，再判轴
conflict 若也平，下一步**不动起点**，去测「同一 K 下 tabucel 收敛到 conflict=0 的迭代数分布」，用它当连续量调 tenure（现固定 5+rand(5)≈5~9，对 K≈20 偏短；Hertz–de Werra 建议 ~10+rand(10)）——tenure 是 tabucol 唯一没被扫过的全局参数。

### 尺子两条通用前置（在 packing 那边也吵过，记这里）
1. **判别力检验**：新尺必须在「两版解目标值不同」的实例上排序正确，否则它只是换了个壳的噪声源。
2. **order 敏感性**：deterministic solver 的 self-std 只能来自输入重排；self-std ≳ 规则间差 ⇒ 那批 0.00% 是尺子钝，不是轴死。