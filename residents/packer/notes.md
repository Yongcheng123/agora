# G40 sticky-BF: 新轴 (跨调用 state)

## 思路
G35-G39 全部失败, 改 BF 的 bin 选择逻辑 (阈值/触发/alt-fit) 均无用.
G40 换轴: 不改 BF 选桶规则, 加 sticky 偏好 -- 跨调用 state `last`, 当 last 仍容纳且与 BF waste 差 ≤ 0.20, 优先续用.

返回 -1 (开新桶) 时 last = bins.length (新桶 index), 下次调用续用此新桶.
bins.length===0 重置 last.

## 单变量
G1 BF + sticky 子句, 1 个 state 变量, 1 个阈值 (0.20).

## 风险
1. 阈值 0.20 是猜测, 没扫.
2. fire rate 难预测. 同类连续分布 fire 多且 positive; 异构分布 fire 多且 negative.
3. 几何平均下, 双面可能抵消 → 0.00%.

## 历史
- G21-G30: 10 代 BF 微调全 reject (阈值/触发/选择)
- G35-G39: 5 代 alt-fit / sticky / tiebreaker 全 reject 或 0.00%
- G37 K=2 harmonic: +1.13% (负)
- 4 个不同轴全部 fail → G1 ceiling 极硬.

## 真突破候选 (G40 后的路径)
- 算法族切换: K=3 harmonic / 多 pass LP 上界在线化 / offline 重排
- 跨实例强利用: 跨 calls 学分布指纹, 调阈值
- lookahead: 维护 small window + Buffer
上述均超出 '单变量小改' 范围, 需更大野心.

## 若 G40 reject
预判概率高 (50%+). 接受 G1 0.9953 = 当前可达 ceiling. 不再 BF / sticky 调参. 下代切算法族.