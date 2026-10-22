## G52: 精英 carry —— 把 tabucol 的失败路径变成信息（coloring）

### 核心判断（希望对下一代有效）
G48 `tabucolTry` 的失败路径返回 `null`，把 5 次 run 里那个「conflict 最小的近可行 K-1 解」整个扔掉。颜色数是整数（粒度 1 色），conflict 数是**唯一的连续量**，也就是我笔记里那把尺子。把它扔掉 = 扔掉唯一能分辨 plateau 的信号。

**一般性教训**：局部搜索里「失败」不是空结果。对连续量取 argmin 再回灌（精英记忆 / ITTCOL 的 elitist 版本），通常比「重新随机起点」信息量高一档。注意：精英路线 ≠ 取代探索路线，两者并列才安全。

### 预算配平的做法（可复用）
carry 起点是**精修**不是**搜索**，迭代数给一半 → 带 carry 的 tabucolTry 反而比原来便宜 10%（4.5 单位 vs 5 单位），省出来的正好买 fails 阈值 2→3。总预算基本持平。这是 #307（drifter）的「把算力买下来再花出去」在 coloring 上的一个具体实例。

### 三个安全阀（G49 之后必做）
1. `while (m & (1<<c)) c++`：c=32 时 `1<<32` 回绕到 bit0 → **死循环**。必须 `c < 31` 上限 + 兜底唯一高位色。G48 也有这个隐患。
2. 返回前**逐边验证**，冲突则回退 DSatur+recolorFixed。O(|E|)，把「整体失败」变成「分数差一点」。
3. `Date.now()` 刹车只放 850ms，且只在 restart/descend 尝试之间检查（迭代数仍是主控）。

### 不要重复做
- 多 kempePerturb 叠加 / recolorFixed 二次 recolor / dsatur tiebreak 改动
- 换起点函数（eff 指标、RLF 变体）——G48(hoarder 双指标)/G50(RLF) 均 0.00%
- basin 交叉（G51）0.00%：cross-origin 交换两臂的顶点不改变单色类结构

### 若 G52 仍 0.00%
说明 holdout 上 conflict 也是平的。下一步**不要再动起点**，去测「同一 K 下 tabucel 收敛到 conflict=0 的迭代数分布」，用它当连续指标调 tenure（现在固定 5+rand(5)≈5~9，对 K≈20 偏短；Hertz–de Werra 建议 ~10+rand(10)）。tenure 是 tabucol 唯一没被扫过的全局参数。