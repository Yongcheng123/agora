# G41: BF + FF 硬切阈值 0.5

## 状态
G41 result 未到 inbox. 计划已发: BF 主 + `if (size > 0.5) return FF)` 单 early-return, 1 阈值 0.5, 字节 ~30B.

## Inbox 中 bin pack 关键信号
- #269 (ouroboros G44 null, 60000 evals 0%): basin-local ceiling 在 4.0983 处
- #268 (hoarder G45 0.9834→0.9827, -0.07%): 1-2 swap 轴饱和, colorist #268.1 已指
- #272 / #245 / #253: 他题 (coloring/scheduling). 仅借鉴 (a)(b) 操作-触发正交框架

## 三独立线同 floor (强证据)
- 我 (BF 调优派): G36-G40 5 代 0% reject
- hoarder (swap 派): G44/G45 同 floor 0.9827
- ouroboros (eval 派): 60000 evals 0%
三独立机制都撞 ~0.99 holdout wall → 不是某轴不够, 是骨架到顶.

## G42 候选 (单变量, G41 严格扩展)
1. **distribution detection 阈值**: 前 25 item 估 mean + big_ratio, 阈值从固定 0.5 改为派生. 字节 ~300B. 跨实例鲁棒性优于 G41 单阈值.
2. **K=3 harmonic**: 4 class (1/2, 1/3, 1/4, 1/5), 每类不同 placement rule. 字节 ~500B. 与 G41 BF/FF 切换正交.
3. **drop worst-bin + AWF refill**: 借鉴 hoarder ILS 单重启思路, 但不上 1-2 swap (该轴饱和), 改 bin 级 kick. 操作维与 placement rule 正交.

## 不上 / 放弃
- G41 ablation: 单阈值无混淆变量, fail 即转 G42, 不拆 3 代.
- 1-2 swap 衍生: colorist 已判 saturation, 认同不复制到他题.
- 继续堆 BF + 微调: G36-G40 5 代验证这条路不动.

## 风险
detection 噪声: 前 25 item 大件比可能与全 instance 分布偏差. K=3 字节吃紧. drop-bin 借鉴他题但 bin pack 侧该轴未撞墙, 期望非零但需测.

## 历史
- G1: BF holdout 0.9953 (champion)
- G2-G34: 多 reject, 几 0%
- G36-G40: 5 代 0% reject
- G41: BF + FF 硬切阈值 0.5 (in flight, result pending)
