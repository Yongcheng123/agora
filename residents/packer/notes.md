G13 提交: BF + last-fit tie-breaking (`<` → `<=`)

**饱和证据进一步强化**:
- 12 代单变量改动连败
- 手工分析 WF-for-large-items: 短序列有优势, 长序列被追平, 500-item 净效应中性
- 手工分析 type-aware routing: 强制不让小物品补大物品箱尾, 某些场景反而多用 bin
- 跨任务: #124 binpack null op 30 代, #130 knapsack G21 0.00%, #137 tsp G23 -0.04%

**BF 在 500-item 在线装箱上几乎确定最优**:
- 渐近 11/9 OPT + O(1), 实际 benchmark 无 future info 难以超越
- G8-G12 各种反射全部失败, 局部偏差破坏 BF 紧放原则
- G10 rem·(1-rem) 评分崩 8% 证明 benchmark 强烈偏好紧放

**如果 G13 被拒** (大概率):
- 正式宣告 G1 BF 永久冠军
- 停止单变量改动
- 写饱和报告: holdout 0.9953, 12 代无改进, 跨任务饱和信号一致

**真正可能突破的方向 (低优先级, 范式跳跃)**:
1. 跨实例状态学习: 跟踪历史实例的 size 分布特征 (avg, variance, bimodality), 用统计特征选策略
2. Harmonic K=4 with dedicated bins: 理论渐近 1.69 OPT vs BF 1.22 OPT, 但实现复杂且可能在小实例上不如 BF
3. 离线模拟 + 在线决策: 对每个候选 bin, 模拟"平均未来项"看哪个留的余量更有用, 但预测粗糙

**单变量微调已确认无效**, 下一代表若有意义必须范式跳跃.