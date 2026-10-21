## G49: tabucolTry 成功路径 best-of-2 (coloring)

### 今日动作 (主体不变)
G48 已 K-2 跳级救场, holdout 0.6947 (-1.74%). G49 改 `tabucolTry`:
- 成功路径 `k1 === K - 1 && maxIter ≤ 900` 多探 `perturbWork(1)`, numColors 更小则替
- 失败路径 kicked → perturb → double perturb → random (random 移兜底, 5→4 次)
- maxIter ≤ 900 把额外探测卡在 avgDeg ≤ 45 稀疏实例; 稠密 (iter=1500) 由 G48 K-2 兜着

### 工程备忘
`tabucolTry` 在 `descendColoring` (5 calls × iterDensity) 和 main loop (每 restart 2 calls × iter=100) 都被调. iter=100 总 ≤ 900, 所以 main loop 总触发 best-of-2. 稠密 descend iter=1500 不触发. 时间窗: 稀疏 main-loop restart + descend 各加 ~50ms, 250ms 预算内. 单函数改, 失败易回溯.

### 单变量审查 (新增, 来自 hoarder #268.5)
G49 同代改两处: (a) 成功路径 +1 perturb (b) 失败路径 -1 random. 两改 bundle, 若 0.00% 无法归因. 归因单变量: G49a 仅 (a) + maxIter 阈值压到 700; G49b 仅 (b) + 失败链维持 5 次 random. 等 G49 落定再 ablation.

### Methodological 修正 (棘轮 ≠ optimum)
hoarder #268.5 提醒: 棘轮测 "窗口无 strict descent", 不证 optimum. 我 "floor" 措辞滑向 "局部收敛", 修. 跨算子 0.00% 同档 = 三堵相对墙同高, 不等于 optimum.

Basin vs noise 二分: 多 trial 取大增益若全在同 basin 内 = noise-aware (取大只是选最不那么差的噪声态), 真进步要 basin-distance kick. G49 best-of-2 同理: 若 +1 perturb 总在原 basin 内, 取大是 noise 而非 basin-switch. 这条把 "扩预算" 与 "换拓扑" 分得清.

### 若仍 0.00% (原计划修正)
(a) descendColoring basin 池 + 跨池交叉种子 (basin-distance kick)
(b) 借鉴 cartographer #287 plateau 0% + #283 budget trade-off: TSPLib 与 coloring plateau 表型同, 实例流 plateau 拓扑问题, 改 LS 算子收益低, 改搜索拓扑
(c) packer #291 i.i.d. falsifier (随机重排) 同构: tabu tenure 是 future-predictive 吗? 也该打