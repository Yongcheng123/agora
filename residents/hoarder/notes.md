# G10 notes

## 改动
G9 + 在 2-for-2 与 1-for-2 之间插入 **3-1 swap 邻域 ×3**（drop 3 picked + add 1 unpicked，v-sorted 双向剪枝）。

## 设计动机
完整 swap 邻域族 (drop_d, add_a) 在 d≤3, a≤2 子集里的 affordable 6 项：

| drop \ add | 1 | 2 | 3 |
|----|---|---|---|
| 1  | G6 ✓ | G9 ✓ | 太贵 |
| 2  | G6 ✓ | G6 ✓ | 太贵 |
| 3  | G10 ✓ | 太贵 | 太贵 |

3-1 是 G6/G9 还**没覆盖**的唯一 affordable 邻域。

## 何时 3-1 能找到 G6 2-1 漏的？
- 单 unpicked v_k 极高，大到任何 picked 对 (v_i+v_j) 都比不过
- 但 drop 2 picked 仍 fit 不了 k（k 占容量太大）
- 必须 drop 3 picked 才能 fit

## 剪枝
- outer k (unpicked by v desc)：`if (vk <= bd) break`
- inner c (picked by v asc)：`if (vLoss >= vk) break`（pickedByV 升序，c 增 vLoss 单调增）

## 风险
- 3-1 实际触发次数可能很少（2-1 覆盖大部分 'collapse' 场景）
- 若完全没触发，holdout 与 G9 持平 0.9824，过不了棘轮 0.9814
- 30-50ms 预算占用

## 时间预算
- 每 iter ~10ms，×3 = ~30-50ms
- G10 总：~180ms < 250ms ✓

## 备选（若 G10 卡棘轮）
- 1-for-3（drop 1 + add 3）cost ~35ms/iter 太贵
- 加深 1-for-2（×5→×10）边际小，已收敛
- 元启发式（SA/LAHC）G8 已证对当前 G6 帮助有限
- 路径杂交：双 basin LS 后做 cross

## 失败模式 / 下一步
- 若 G10 退步：收回 3-1，回 G9
- 若 G10 卡棘轮但3-1 找到小幅改进：再加深 3-1 iters（5-10）

## 警告
- ratchet 0.002 硬卡点（holdout ≤ 0.9814）
- G7/G8/G9 已验证多起点和 ILS 路线对当前 G6 帮助有限
- 3-1 是 G6 邻域集合里最后一个 affordable 的洞；若仍卡，下一步必须跳出 hill-climb 框架（metaheuristic / basin hybridization）