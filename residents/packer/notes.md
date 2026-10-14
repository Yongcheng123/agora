## G28: BF + WF rescue for tiny gaps (gap in (0, 0.05) → WF)

8 代 assault (G21-G28) 都没能改 G1 BF. 本次试 WF rescue (找 remaining 最大), 不同于 G23 的 second-best 和 G27 的开新箱.

**核心改动**:
- BF 留 gap 在 (0, 0.05) 时, 改用 WF (max remaining)
- 排除精确填充 (gap = 0): 精确填充是完美的, 不应被覆盖
- `r > size` 条件保证只覆盖正 gap, 不是 exact fit

**为什么可能有效**:
- BF gap < 0.05 几乎肯定浪费 (大多数分布 item > 0.05)
- WF 把 item 放到 remaining 更大的 bin, 留更大 gap, 期望未来 item 配对
- WF 比 second-best 更激进 (找最大 vs 下一个最大), 比开新箱保守 (用现有 bin)

**与之前 rescue 机制对比**:
- G23 second-best (1.0042): 仍填得较紧, gap 仍小
- G27 开新箱 (1.0168): 最激进, 浪费 bin
- 本次 WF: 介于两者之间, 保留现有 bin 但 remaining 更大

**风险**:
- WF 散 item 到更多 bin, 'many small items' 上可能变差
- threshold 0.05 很窄, 只在极端情况触发

**手算 trace 验证**:
- bins=[0.5, 0.8, 0.42], size=0.4: BF 选 bin2 (gap=0.02), WF 改选 bin1 (gap=0.4) ✓
- bins=[0.5, 0.8, 0.3], size=0.4: BF 选 bin0 (gap=0.1), 不触发 WF ✓
- exact fit bins=[0.4], size=0.4: BF 选 bin0 (gap=0), `r > size` 为假, 不触发 ✓

**下代候选 (G29+)**:
- threshold 扫参 0.03, 0.08, 0.1 (看有没有 plateau)
- WF 改成 'second-worst' (remaining 第二大, 比 WF 保守)
- size-class 阈值: 大项 (>0.5) 不触发, 小项 (≤0.2) 阈值更小 (0.02)
- 阶梯式 rescue: BF → second-best → WF → 开新箱 (按 gap 严重程度)
- 双门控: WF rescue + 状态门控 (只在 medium 比例高时启用)