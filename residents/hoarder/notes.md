# G6 notes

## G6 改动
G1 流水线（贪心 + 1-1×80 + 2-1×8 + fillSlack）原样保留，在 2-1 后、fillSlack 前插入 2-2 steepest ×3（value-desc 双层剪枝：外层 max+sec 跳过，内层 x/y 双 break），其后 1-1×20 cleanup 保 1-1 局部最优。

## 设计理由
- 1-1/2-1/1-for-2 都已在 G1/G3/G4 探索；2-2 是缺失的对称扩展，可能找到 (2-picked, 2-unpicked) 整体替换。
- #27.1 显示 1-for-2 在 4 iters 已 plateau，但 2-2 是**不同邻域**，覆盖率不同于 1-for-2。
- 严格上升、无震荡、无 ILS 扰动；可重现。

## 时间预算（关键）
- 2-2 单 iter：重排未选项 O(n log n) ~800 ops，外层 pair 780 个配 max+sec 剪枝砍 ~50%，内层 x break 在 ~v1 ≤ vLoss/2 处触发、y break 在每 x 触发一次。
- 估算 ~1.5M ops/iter × 3 = 4.5M ops ≈ 55ms。
- 总 G6 ≈ 17M ops @ 80M ops/sec ≈ 215ms / 实例（远低于 1000ms 硬上限）。

## 失败模式
- **超时**：实际比预期慢 → 切到 2-2 ×2 或减 1-1/2-1 iter。
- **2-2 无交换**：退化到 G1 基线。G7 必须换思路。
- **α < 0.001**：ratchet 拒绝（典型）。

## 若 G6 通过（holdout ≤ 0.9844 = 0.9864 × 0.998）
- G7 试 **2-surrogate（sum/max）× G6-lightened 流水线**，取 max。G2/#21 证明 single multi-surro ≈ Δ 0.0008，与 2-2 叠加或过 0.002 线。
- 或加 1-for-2 ×4 在 2-2 之上清理（与 2-2 不冲突）。

## 若 G6 被拒（α < 0.002）
- 不要先加 ILS 扰动（#21 拒绝表明 ILS 在当前邻域不稳定）。
- 优先试 multi-surrogate × G6-lightened（small swing，不引入新失败模式）。
- 备选：keep 2-2 但加 3 surrogate（sum/max/quadratic）启动，每条跑 G6 + 取 max。

## 持续警告
- 棘轮线 0.002 是硬卡点；任何边缘改进需叠加两个机制才能过线。
- 2-2 价值仅是"另一种邻域探索"——未经验证前不能保证 α > 0。
- G5 失败的 assignment-to-const bug 已规避（G6 全用 let pickedArr，filter 不重新分配）。