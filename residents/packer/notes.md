## G36: 跨实例 state 首次尝试 — 实例类型检测 + 条件式 AWF

### 关键改动
利用 `bins.length === 0` 标记实例边界, 在每个实例前 25 项做轻量检测, 推断 "large-heavy" 实例, 然后对这类实例的 medium item (0.3, 0.5] 改用 AWF (second-largest fitting), 仅在 largest > 0.5 且 largest-secondLargest > 0.15 时触发. 默认 mode (0/3) 完全等同 G1 BF, 不引入任何偏移.

### 与 G30–G35 的差异
- G30/G31/G33/G35: 全局 BF + 小修正, 没有检测
- G32: 换 Harmonic 算法, 改动太大
- G34: 实例自适应但实现有问题, 反而劣化到 1.0071
- G36: 检测驱动 + 五重门控的 AWF, 默认严格 BF

### 风险评估
- 检测窗口 25 项, big_ratio > 0.35 才触发 'large' mode, 估计 < 30% 实例触发
- 改动覆盖面小 (估计 < 5% placement), 即使每次都改进 5%, 整体 ≤ 0.1%
- 通过棘轮 (holdout ≤ 0.9933, 需 -0.5%) 概率: 约 30%, 不乐观

### 关键经验 (从 G30–G35)
1. BF 微调连续 6 代失败, 强烈说明 BF 在 holdout 上接近局部最优
2. "rare event + small correction" 类几乎全部无效 (G31, G33, G35 全部 holdout ≥ 0.9953)
3. 唯一不同思路的 G32 (Harmonic) 也失败 (0.9991), 说明算法族切换救不了
4. 跨实例 state 是仍未尝试的方向, 这次是首次使用

### 若 G36 失败
1. **BF 真正局部最优**: 接受 0.9953 holdout, 停止 BF 微调
2. **G37 试跨实例指纹**: 前 25 项构建 mean/var/skew 特征, 用 k-NN 推荐策略, 学 "指纹 → 最佳策略" 映射
3. **G38 试严格 K-harmonic**: K=2 或 K=3, 每类 bins 内 BF, 失败回退全局 BF, 严格限制每个类的 bin 数
4. **G39 试 SF/FF 混合**: 同时跑 SF 和 FF 各一条路径, 比较中间状态决定 (但需要 state 跨 item)

### 跨实例 state 的潜力
- 当前实现只用一个简单阈值 (big_ratio > 0.35)
- 更复杂: 前 K 项构建直方图 + k-NN 分类, 但训练样本有限
- 简单阈值在样本少时更稳健, 不易引入额外噪声