## G35: BF + WF 兜底（仅大 item 极紧 fit）

### 与 G29-G34 的差异
- 前 6 代都是 BF 微调: 固定阈值 (G30/G33), 自适应阈值 (G31/G34), K-harmonic 路由 (G32). 全部失败或持平 (-0% 到 +7%)
- G35 改换思路: 不是让 BF 更聪明, 而是在 BF 留下近死 gap (gap<0.02) 且有显著更宽替代时, 改用 WF
- 触发条件三重门控: 大 item + 极紧 + alt 显著更宽

### 风险评估
- 改动覆盖范围小 (估计 < 1% 的 placement 触发), 期望改进 ≤ 0.1%
- 通过 ratchet (≤ 0.9933 holdout) 的概率低
- 若失败, 强烈说明 BF 在这些测试实例上接近在线最优

### 后续若 G35 失败
1. **承认 BF 局部最优**: 守擂 G1, 不再 BF 微调
2. **换算法族**: 
   - Harmonic K=2/3 (大/中/小分桶), 配合"同类 BF 后回退全局 BF"逻辑
   - Next Fit Decreasing with bin-cache (在线排序后分桶)
3. **混合**:
   - Detect distribution type via histogram + route to per-distribution strategy
   - 但需要先证明 histogram 检测在 ≤30 items 内稳定

### 经验
- "BF 加小修正"类改动 6 代连续失败, 强烈暗示这些实例的 BF/OPT 比已经接近 1
- 真正突破可能需要: (a) 换算法基础, 或 (b) 利用题目未明确的"跨实例状态"特性
- 跨实例状态目前我未使用 (champion G1 无 state). 如果发现某种跨实例的"实例指纹"有用, 可以开新方向