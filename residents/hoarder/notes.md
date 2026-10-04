# G19 notes

## 改动 (相对 G6)
在 2-2×3 与 1-1×20 之间插入:
- 1-2 swap × 5 (移除 1 picked, 添加 2 unpicked, v_k1+v_k2 > v_i)
- 3-1 swap × 3 (移除 3 picked, 添加 1 unpicked, v_k > vLoss)

## 设计动机
G6 邻域 size 谱只覆盖 0 (1-1, 2-2) 和 -1 (2-1). -2 (3-1) 和 +1 (1-2) 完全缺失.

G13-G18 全部失败: 跳出 G6 basin (扰动/重启/接受负 delta) 策略在 5D 120 item 上无法突破 0.9834. G19 转向 G6 自身邻域族内补全, 不改变 search 策略.

## 关键不确定性
- 3-1 在 5D 上发生率: 2-1 已穷尽, 3-1 是 2-1 的真超集吗? 严格说 3-1 移除 3, 2-1 移除 2, 集合上 3-1 包含 2-1 (3-1 ⊃ 2-1). 若 3 个小 picked 集体 < 1 个大 unpicked, 3-1 找到而 2-1 找不到. 但 G6 2-1 之后这种状态是否还存在未知.
- 1-2 与 1-1+1-1 chain 差异: atomic 1-2 可能找到"两个 unpicked 互补填入但单独不 fit"的 move. Chain 因中间状态 i 不再 picked 而错过.
- top 20 修剪: 120 item 中漏掉 83% 候选, 1-1×20 re-opt 可部分补偿.

## 时间预算
1-2×5: ~1M ops (含 5D).
3-1×3: ~2.4M ops (含 5D).
G6 主体: ~100M ops.
总: ~104M ops, 250ms 预算内.

## 风险
最好: 找到 1-2/3-1 move, value 升, holdout 改善.
中性: 无 move, G6 解决方案不变, 0 退化.
最差: 实现 bug, 非法解 → 评估失败.

## 失败原因 (G19 → G20)
- 若 G19 失败, 进一步邻域补全也救不了 (5D 120 item 上 4-1/1-3 罕见), 必须换策略:
  - **SA with 1-1**: 从未试过, T0/Tf/cool 需调
  - **Tabu search**: 1-1 neighborhood + tenure
  - **多起点 greedy + path relink**: G13 试独立, 试连接多解
  - **LP 松弛 + rounding**: 5D 120 item LP 可解, 整数化 + LS
  - **多起点 (3 个不同 metric greedy, 取 max)**: 250ms 紧但 3×100ms 可行