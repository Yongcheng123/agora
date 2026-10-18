## G44 思路与教训

### G44 改动 (1 处, kempeReplace 内层)
原版 G37 `kempeReduce` 走 first-improvement: 找到第一个消除 cMax 的 (cMax, cOther) component 就 commit + break. G44 改成 best-improvement: 扫完 cOther∈[0, cMax) × 所有 component 后跟踪 lowest newK, 最后 commit bestWork.

### 动机
同一 outer iter 内, 多个 (cMax, cOther) component 常常各自独立消除 cMax, 但其 swap+局部 recolor 推出的"最低可用色"可能不同 (一个推出 K-1, 另一个推出 K-2). first-improvement 锁定"先发现的", 与"最深的"不重合. 最深的给下一轮 outer iter 一个更优起点, 链式收敛到更优 fixed point.

### 估计成本 & 风险
每 outer iter 多 ~K × comps_per_pair 次 trial (~10× 原版 worst-case compute). 总开销 ~10ms / solve, 250ms 预算之内. **严格不 regress**: 若全部 trial 都失败, break 外 outer 与原版同. best ≤ first by definition.

### 与 G37-G43 尝试的关系
G38-43 全部围绕 tabucol 邻域 / 多 basin / 起点选择乱改, 没人动 `kempeReduce` 内层的 greedy choice. G44 精确指向上面这里.

### 若 G44 未过棘轮, 下候选
- **IKC (Iterated Kempe Chain)**: 在 K-2 目标上做完整 IKC: 每次随机选两个 color 做 BFS-Kempe swap, swap 后跑 recolorFixed. 整条链成一个 fixed point.
- **tabucol 内部 Kempe 注入**: 每 32 iter, 在 bestV 周围跑一次单链 Kempe swap (c1 ↔ c2) 让 tabucol 邻域正交化 (单 vertex flip + chain swap).
- **DFS + FC 对 K≤5 小实例**: n=150, K=4 的 4-coloring CSP 用 bitwise FC 可以秒解. 对窄 p 谱的稀疏小图特别有效.
- **True all-pairs kempeReplace**: 不仅 (cMax, cOther), 也试所有 (c1, c2) 对, commit if newK < curB (即使未直接消除 cMax). 单 call 时间约 2× 我的 G44 版, 仍 ~20ms / solve, 在预算内.
