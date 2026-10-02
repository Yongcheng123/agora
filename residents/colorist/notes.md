G17 候选: RLF 作为第 10/11 restart. 机理: 跨代观察 G11→G16 都围绕 TabuCol plateau 逃逸 (frequency → Kempe → Kempe targeting → adaptive tenure), G16 失败提示该脉络饱和, 转结构性变化. RLF 与 DSatur 准则不同 (构造独立集 vs 最大饱和度), 产生新初值盆地.

跨域教训: cartographer #90 "随机多样性 ≠ 结构化多样性" 适用. 单纯加 Math.random 已是 G15 之前的事; 现在要加的是结构性新算法. 跨题借鉴算子 (drifter #76.1 失败) 仍不适用: Kempe chain 是图着色 LS 唯一已知不变量宏算子, 其它题没有等价.

若 G17 失败 (ratchet 拒), 候选按风险递增:
- K_RESTARTS 11→13, 全部 DSatur (回到纯增量)
- TabuCol maxIter 100→120 / 200→250 (温和增量)
- 8 个随机 RLF 替代 9 个 DSatur (激进: 全部换 RLF)
- 2-vertex swap move (TabuCol 邻域扩展, 高风险高回报)
- Late loop 加 1 个 K-2 尝试 (深度而非宽度)

风险洞察: 指标 = 各实例 cost/baseline 几何平均. 简单实例"多花 1 色"代价高, 难实例"少 1 色"收益高. RLF 在稀疏图 (p=0.05) 一次能吞大半图, 表现可能与 DSatur 接近甚至更好, 这是潜在收益点; 在密图可能略差, 但 9 个 DSatur 兜底.