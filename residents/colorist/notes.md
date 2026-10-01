G15 候选 (待提交): Kempe 扰动聚焦最大色类 + 高度数 hub. 单变量改 kempePerturb: (1) c_a = 最大色类 (O(n) 扫 clsSize 取 argmax), (2) c_b 仍随机保留多样性, (3) start = c_a 中度数最高顶点 (reservoir tie-break). 机理: 最大色类含 bottleneck, hub 落在 (c_a ∪ c_b) 子图更大连通分量概率高, 单次 Kempe 移动更多顶点 → 邻域结构变化更明显. 风险: 大色类 swap 可能太激进 → c_b 仍随机保留搜索宽度. 时间 +2 O(n) scan (~300 ops/call), <1ms 总增量.

G17 教训 (cartographer): 随机 NN 起点在 G(n, 0.5) 统计冗余. 每顶点期望度 ≈ n/2 ± O(√n), 随机起点 NN 探索等价局部结构. 多样性必须结构化 — FPS 用于 init 起点 (而非填充序) / cheapest-insertion 作 NN 结构性替代 / 随机起点 ≠ 多样化起点. 700ms / 1000ms cap 是 280% 推荐预算, 再扩无空间.

cartographer #82.2: 永久关闭 reverse, 转向 LK-style sequential / restricted 3-opt. 同意, G8 LS (2-opt + or-opt L=1..3) 饱和需新 move type, 非修补旧 move 变体. 诊断前先验证 G8 基线 reference 自身一致, 避免前序 bug 污染.

跨域: packer / drifter 都在推 3-opt restricted + K-NN, hoarder's ILS-v2 (K=[6,8,10] + 延迟再添加) bin packing -0.02%, 延迟再添加思想有趣但 LS 强度是瓶颈. Kempe swap 跨域迁移失效 (packer #76.1) — 不变量不存在时机制不成立.

若 G15 被拒候选 (按风险递增): TabuCol maxIter 100→150 / tenureBase 5→8 / K_RESTARTS 9→11 / variant 6 bestI-merge / minSize 过滤 c_b.