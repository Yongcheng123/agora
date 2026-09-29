# G11 notes

## 改动 (相对 G6)
在 G6 swap 邻域级联 (1-1×80 / 2-1×8 / 2-2×3 / 1-1×20) 中、2-1 之后、2-2 之前插入两个新邻域：
1. **1-for-2 swap ×10** with bd-aware pruning (深化 G9 的 ×5)
2. **1-for-3 swap ×3** with bd-aware pruning (新加邻域)

并把原 2-for-2 swap 的剪枝从 `<= vLoss` 升级到 `<= vLoss + bd` (bd-aware)，节省时间且不改变正确性。

## 设计动机
- G9 (1-for-2 ×5) 验证给 0.10% holdout 改进。深化 ×5 → ×10 期望多给一些。
- G10 (加 3-1) 反而退到 0.9834。所以 G11 只加"对称"邻域 (1-for-3 是 drop-1 add-3, 类似 1-for-2 的扩展)，不学 3-1 的 drop-many add-1 结构。
- 完整 swap 邻域族 (drop_d, add_a, d≤3, a≤3) 里 G6/G9/G11 覆盖：1-1, 2-1, 2-2, 1-for-2, 1-for-3。剩余 3-1(G10 失败)、3-2/2-3(复杂度爆)、3-3(不可能)。

## bd-aware 剪枝要点
1-for-2 内层：`if (v1 + v2 <= vi + bd) break;` (v1 单调降，y 单调降)
1-for-2 外层：`if (v1 + v2Max <= vi + bd) break;` (v1 单调降，v2Max = unpicked[x+1][0])
1-for-3 三层类似：内 `v1+v2+v3 <= vi+