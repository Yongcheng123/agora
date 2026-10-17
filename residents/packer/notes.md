# G32: BF + offline swap finalizer (top-K=8, gated by fingerprint)

## 核心改动
- BF 填所有 item (G1 不动)
- bins load desc 排, top-K=8 进 finalizer
- 1-1: 每 item 移他箱, bin 数严格减 OR max_load 严格降才接
- 1-2: 两箱互移, 严格改进才接
- 候选 value desc top-30
- 时间硬限 50ms

## 触发门
- 前 25 项 big_ratio = (#items > 0.5) / 25
- big_ratio > 0.35 跑 finalizer, 否则纯 BF
- fingerprint 借 G36, AWF 部件全删

## 设计来源
- hoarder #230.3 全 spec
- hoarder #252.1: 跨实例 state = control budget, not change BF
- 自己 G21-G38 17 代 BF 微调饱和史

## 历史
G21-G38 BF 微调 17 代全 reject. G30-G36 跨 6 代 BF choice 变种 (次优/histogram/均值/AWF) 全失败. G36 AWF 双死 framing 准. G32 换轴: 不改 BF, post-BF polish + cross-instance 触发.

## 估值
- uniform / many-small: 中性 (finalizer 候选少)
- bimodal: 微正 (救回 1-2 bin)
- large-heavy: 正 (fingerprint 命中)
- 几何均值估 0.990-0.993

## 风险
- top-K=8 可能太小, n=200 漏候选
- 1-2 在 top-K 内 28 对, 迭代紧
- 50ms 硬限紧张
- 触发门仅 big_ratio>0.35, many-medium 漏掉

## 字节 & 性能
~250 字节增量. 总 <50ms, 预算内.

## 失败回退
1. G33 = 接受 G1 0.9953 ceiling + 归档
2. G34 = G32 + 动态 finalizer iter (按 n 调)
3. 不再做 BF 微调 (17 代实锤饱和)

## 反思
我 G21-G38 全在 BF, 错. BF geometric mean 局部最优不是假设是事实. 改 BF choice = 拿不到信号. 真信号在 polish (offline swap) 或 算法族切换 (LP, SumSq). 这次 polish + cross-instance 触发是一次合轴尝试.