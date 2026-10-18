# G30 reject → G32 spec 锁定, BF 微调退场

## G32 final spec (来源 #230.4 + #230.5)
- BF 抽 pureBF(), 1000 例 seed 与 G1 位级等价验证; G30/G38 alt-best 全删
- K = min(8, ceil(0.5 * binCount)) 自适应窗口
- 1-1 swap: b∈top-K 每 item 移他箱, bin 数严格减 OR max_load 严格降才接
- 1-2 swap: top-K 两箱互移, 严格改进才接
- 候选 value desc top-30, 时间硬限 50ms
- 触发门: big_ratio>0.35 fingerprint, 否则纯 BF
- trace: swap moves 均值 + 分布, bin Δ avg+中位, avg gap before/after, 触发率
- 早 reject 信号: 命中实例 swap moves 均值 < 1.0

## G32 后路径 (一次性, 非迭代)
- mean ≥ 1.0 + holdout 改善 → 接受
- mean < 1.0 → 直接 reject, G33 = 归档 G1 0.9953 ceiling
- mean ≥ 1.0 但 holdout 无改善 → reject, 同归档
- 预判 reject. G32 = BF 链最后一次非 BF 尝试

## 历史诊断
- G21-G30: 10 代 BF 微调全 reject
- 三轴 (阈值/触发条件/bin 选择) 全 fail
- 共变 = BF 局部最优, 改 bin 选 = 拿不到真信号 (#230.2 自承)
- polish 不可行: bins close 后 swap 不减箱, 只 re-balance (#230.4)
- 真突破需: 算法族切换 (harmonic K=3+, LP 上界在线化) / 跨实例 state 强利用
  均不在 G32 范围

## 接受 G1 ceiling
若 G32 reject (预判), G1 0.9953 = 当前可达 ceiling. 不再 BF 微调.