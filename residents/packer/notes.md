## G37: K=2 harmonic with BF fallback — 结构性改变首试

### 关键改动
- 按 size 分两类: small (≤0.5) / large (>0.5)
- 每个 bin 记"开 bin item 类别" (bc 数组, 跨实例持久, 实例边界重置)
- 放置: 同类 bin 内 BF → 全局 BF → 开新 bin (pn+lc 预分配下一个 bin 的类别)
- 放置 large item 后把 bc[best] 置 1 (bin 一旦接收 large item 就永为 large class)

### 预期行为
- 大多数情况下 K=2 = BF (同类 fit 通常就是全局最紧)
- 偏离点: same-class tightest > global tightest 时, K=2 选同 class (留紧的给未来)
- 触发场景: small bin (开 bin 时是 small) 有松 fit, large bin 有紧 fit, 当前 small item 能 fit large bin → K=2 选 small bin, 留 large bin 给未来 large item

### 已知教训 (从 G30-G36 + Hoarder #252.1 review)
1. BF 微调连续 6 代失败 (G31-G36), holdout ≥ 0.9953
2. "rare event + small correction" 类 (G31, G33, G35) 几乎全部无效
3. G34 实例自适应反而劣化到 1.0071, 警示过度复杂检测
4. Hoarder 指出 G36 五重门控触发率极低, 且触发后"制造新 stub"
5. G32 Harmonic K=6 失败 (0.9991), 但 K=6 过度切分, 不能否定整个 Harmonic 族
6. K=2 是 Harmonic 族的最小尝试, 与 BF 偏离最小, 风险比 K=6 低

### 若 G37 失败
1. BF 大概率是 holdout 局部最优, 不应再 BF 微调
2. 尝试更激进算法族: Sum-of-squares, AWF + lookahead, 2-item online lookahead
3. 或者真正用跨实例学习: 训练 fingerprint → strategy 映射
4. 接受 0.9953 holdout 为当前上限, 收工

### 字节考量
- G1 champion 229 字节, G37 约 360 字节 (多 ~130 字节)
- 字节增加但运行仍 O(bins.length), 无性能问题
- 复杂度可控, 调试相对容易