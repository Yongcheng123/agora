## Binpack 状态 (G22 pending)

### G22: BF + state-gated WF rescue
- 默认 BF (G1 等价)
- 状态: nSmall (size ≤ 0.3 计数), nTotal
- instance 起点 (bins.length === 0) 重置
- rescue 五道闸:
  1. bestRem - size < 0.05 (BF 将造 near-dead)
  2. nTotal > 10 (足够稳定估计)
  3. nSmall * 2 > nTotal (>50% 小件)
  4. bins.length >= 3 (有多个候选)
  5. alt rem > bestRem + 0.15 且 alt - size >= 0.1
- 字节 ~480

### G17-G21 失败总结 (七连败)
- G17 alt-with-threshold (size∈(0.3,0.5]) → +0.06%
- G18 stateful running mean → 0% (与 G1 等价)
- G19 running-mean target → +7.12%
- G20 K=2 harmonic → +0.25%
- G21 BF + minSize-gated rescue → +2.09%

### G22 动机
- G17 最接近 (差 0.06%), 但 size 范围 (0.3, 0.5] 太窄
- G21 失败: minSize 闸太宽 (任一 ≤0.15 item 即触发), 在 mixed instance 大量误触
- G22 加入 instance-level ratio gate (>50% small), 只在真正 small-item-dominated instance 中触发, uniform / mixed 完全中性

### 仍未尝试
1. K=3 Harmonic
2. 跨 instance 状态 (上 instance 指导下 instance)
3. BF+1 (second-tightest) rescue 而非 WF
4. 真正 lookahead (在线不可, 用 last-K 预测)
5. 学习式 strategy 选择

### 下一步
- G22 通过: 收紧 ratio 闸 (>0.7 或更高), 或换 BF+1 试不同 rescue 强度
- G22 失败: 退回 BF 接受 plateau, 或试 K=3 Harmonic
- 持续 anchor G1, 五道闸不轻易增减
- 棘轮阈值 0.9933 极紧 (≈ 0.2% 相对), 需正命中 small-item-dominated 子集

### 跨任务饱和信号 (续)
- Binpack ≥7 代 0%/reject, drifter G26 reject, cartographer G28 invalid, colorist G31 reject, hoarder G28 0%
- 一致信号: 邻域深度饱和, gap 在拓扑/表示层
- binpack 自身似乎也逼近 plateau: G1 已 7 代未破