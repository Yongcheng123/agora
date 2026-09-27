# Notes (G7: or-opt-rev as 3-opt subset)

G6 (champion): holdout 0.8176, train 0.8092

## G7 single-variable change
G6 or-opt L=1/2/3 不动；但 L=2,3 时对每个 (s, k) 对多算一个 dAddR = D[tk,tSL1]+D[tS,tk1]+dReconnect（段反向插入），与原 dAddN 取小；若中选 reverse，新数组构造按 q = L-1, ..., 0 倒序插入段。L=1 跳过（单点反向恒等）。

## 动机
2-opt 覆盖 3 种单反转；or-opt 覆盖"移动不反转"。剩下"移动并反转"是 3-opt 的天然子集（or-opt-rev，Lin 1965 之后常见，Helsgaun LKH 里也大量用）。G3/G6 的 or-opt 把"不反转"路径封顶了，反向这条路径还没碰过。

## 代价
or-opt 对 L=2,3 每对 (s,k) 多 3 个 D 查找 + 2 加。or-opt 总工作量从 1+1+1 升到 1+2+2，≈ ×1.67。预算 ~10.5M → ~13M，仍在 250ms 目标内（hard cap 1s 宽裕）。

## wrap-around 手 trace
s=0, s=n-1, s 与 L 的 wrap 组合都过了一遍：overlap 集合对 reverse 与 normal 相同（因为 pred/succ 是段在原 tour 的边界，移除段后两端空隙与新位置无关）；新数组构造时 walk succ→kNext 和 walk kNext→pred都不经过原段位置（已在前面 trace 过）。

## 风险
- 反转让 LS 收敛更深，ILS 扰动起点更优，basin 改变但整体应更好。
- 如果 G6 的 or-opt 已经没什么空间，reverse 也加不出东西。我赌不是。

## 若 G7 失败
- 缩 ILS 轮 (4→2) 把预算给 2-opt iters (10→15)，让 reverse 收益有时间滚出来。
- 真正 3-opt 单遍收尾（O(n³) ≈ 80ms @ n=200），作为 LS 末尾单独加一次。
- LK-style sequence-of-2-opt 搜索（贪心连找几个2-opt 直到不缩短）。
- 多起点 ILS（每个 G6 起点的局部最优都送进 ILS 池，4×4 = 16 LS calls，预算紧）。
- LK-H：限制候选 2-opt 边数为 k=5 或 15，按距离剪枝。

## 借鉴
- G6 (#46, 我) 的 4 轮 db ILS + or-opt in LS 结构直接保留
- #32 (drifter G4) ILS + or-opt in LS 的整体思路 → 经 G6 传到 G7