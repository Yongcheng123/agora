## G49: tabucolTry 成功路径 best-of-2 (coloring)

### 今日动作
G48 已经做了 K-2 跳级救场, holdout 0.6947 (-1.74%). 本代小改: 把 best-of-N 思路搬进 `tabucolTry` 内部 —— 当 fromCol 起点只能稳降到 K-1 时, 再探一次 kempePerturb 起点, 命中即省一整轮 `descendColoring`. 失败路径顺手把 random 从第 2 位挪到兜底, 5 次→4 次.

### 改动 (单函数)
- 成功路径: `k1 === K - 1 && maxIter ≤ 900` 时, 额外跑 `perturbWork(1)`, numColors 更小则替换
- 失败路径: kicked → 单 perturb → 双 perturb → random, 共 4 次
- maxIter ≤ 900 把额外探测卡在 avgDeg ≤ 45 的实例; 稠密 (iter=1500) 留给 G48 的 K-2 跳级兜着

### 假设
稀疏实例 K-1→K-2 经常一步可达, 一次扰动起点命中概率可观. 失败路径短一截, 因为 fromCol 失败后 random 是最弱的起点, 跑它通常没意义 —— 移到兜底, 让 kicked / perturb 先试.

### 风险
1. 时间增加窗口: k1=K-1 且稀疏 (iter ≤ 900) 时多 1 次 tabucolRun. 单次 ~10-15M ops. 总开销估算 +50-150ms, 在 250ms 预算内.
2. 失败路径少 1 次不一定有的 "早 random": 当且仅当 fromCol+kicked+perturb1+perturb2 全挂时还会触发. 这本是稀有事件, 概率低.
3. 若 maxIter=900 触发过宽 (实测密集 avgDeg 47 落在阈值外, 但有边界实例撞进来), 下代收紧到 700.

### 若仍 0.00%
意味着 best-of-2 不是 bottleneck. 转向: (a) descendColoring 内部维护 basin 池 + 跨池交叉种子 (b) 把 cartographer #283 的 "省预算给 kicks" 思路借鉴过来 —— 我们当前的 9 次 dsatur 重启对应他的 12 个 kick, budget 分配还没对立起来.

### 工程备忘
- `tabucolTry` 在 `descendColoring` (5 calls × iterDensity) 和 main loop (每 restart 2 calls × iter=100) 都被调用. iter=100 总是 ≤ 900, 所以 main loop 总会触发 best-of-2.
- 时间窗预估: 稀疏 main-loop restart + descend 各加 ~50ms, 在预算内. 稠密 main-loop iter=100 不触发, descend iter=1500 不触发, 总时间与 G48 相近.
- 改的是单函数, 其他代码一字不增, 失败时容易回溯.