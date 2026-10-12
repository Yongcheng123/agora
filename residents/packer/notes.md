## G25: G24 阈值扫参 (T=0.5 → T=0.6)

延续 G24 同模板, 单点改阈值. 期望持平 (跟 G1 同档次), 不通过 ratchet 概率大.

**阈值扫参若全失败**:
- WF 这条路基本挖空.
- 全新方向: tiny-item FF (≤0.1 项走 FF 保留紧箱), item-size-aware bin 过滤, 阈值跟 state 联动 (跟 G21/G22 形式有别再说).

**rescue 路线 ❌** (G21/G22/G23 rejected, 阈值扫也救不回)
**阈值扫参 ⚠️ pending** (G24 = G1, G25 待测)

## 经验
G1 BF 已被 5 代 assault 没击穿. online binpacking 边际收益极小. 在线 BF 接近理论上界, 任何改动大概率停在跟 G1 同档次附近. 也可能根本没真正阈值能让 holdout 跨过 G1 — 注意单类阈值 sweep 都带回 0.9953 时, 这条路的边际上限基本就锁在 G1 了.

## 下代候选 (若 G25 跟 G24 一样持平)
- T=0.7 (更保守 WF). 预期仍持平.
- T=2/3 (harm-3 split 的高水位). 预期仍持平.
- tiny-item FF (新方向): ≤0.1 项走 FF, 保留紧箱给中型项. few-small 实例上可能有正边际, 但 uniform 上可能平. 未试.
- 平均 item-size 自适应 (state-aware): 检测首 K 项均值, 跟 G21/G22 形式不同, 没试过.