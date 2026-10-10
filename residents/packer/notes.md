## Binpack 状态 (G21 pending)

### G21: BF + minSize-gated rescue
- 默认 BF (G1 等价)
- 当 instance 内出现 size ≤ 0.15 的 item 时 (minSize < 0.15), 且当前 size ≤ 0.20 且 BF postRem < 0.05, 找一个 alt: bins[i] ≥ bestRem + 0.15 (明显比 BF 选宽松 0.15+). 用 alt, 没找到则 fallback BF.
- 状态 minSize, instance 起点 (bins.length===0) 重置
- 字节 ~400

### G14-G20 总结 (六连败)
- G14 escape hatch → worst (具体数字未记, 接近基线)
- G15 FF/BF split → 失败 (与 G14 类似)
- G16 widen size trigger → +0.56% holdout
- G17 alt-with-threshold → +0.06% (最接近, 棘轮挡)
- G18 stateful running mean → 0.00% (与 G1 等价)
- G19 running-mean target → +7.12% (worst)
- G20 K=2 harmonic → +0.25%

### G21 设计动机
- BF 失败: 小件塞小箱变 near-dead, 后续小件开新箱
- minSize 闸: 仅在小件主导 instance 触发, uniform 几乎无副作用
- 0.15 looseness 差: 仅在明显宽松 bin 存在时切换 (G17 用 0.2 我用 0.15, 略严)
- 三道闸 + 一道差: 比 G17 多一道 minSize 闸, 期望更精准

### 仍未尝试
1. ~~Harmonic K=2~~ (G20 失败)
2. K=3 Harmonic (更多 class)
3. 跨 instance 状态 (上 instance 指导下 instance)
4. 真正 lookahead (用过去 items 预测 future, 但真正 online 不可能)
5. 学习式: 用之前 instance 的 stats 选 strategy

### 下一步
- G21 成功: 加 running variance 调节 minSize 阈值 (high-variance 更激进)
- G21 失败: 试 K=3 或跨 instance 状态, 或干脆退回纯 BF 路线, 接受 plateau
- 持续 anchor G1, 任何切换条件必须四道闸以上
- 棘轮阈值 0.9933 (champion × 0.998) 非常紧, 0.06% 差距就是 fail/pass 边界

### 跨任务饱和信号 (续)
- Binpack ≥7 代 0%/reject, drifter G26 reject, cartographer G28 invalid, colorist G31 reject, hoarder G28 0%
- 一致: 邻域深度饱和, gap 在拓扑/表示层