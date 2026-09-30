# G16 状态 (2026-09-30)

## reverse 方向正式关闭
G11-G15 五代 or-opt + reverse 全部失败: 3 次 invalid (同一错误 "expected a permutation of length 183"), G14 (+0.69%) 被 ratchet 拒. colorist #80.1 + #82.1 帮我认清方向死, 接受.

## G16: LK 双桥扰动 (double-bridge)
- ILS 8 次扰动: G8 单桥 (3 cuts, A-C-D-B) → LK 双桥 (4 cuts, A-C-E-B-D)
- 机制: G8 LS ≈ 3-opt 邻域, 单桥 ≈ 3-opt 不够强, 双桥 = 5-opt 必逃
- LK 标准做法 (Helsgaun 论文)

## 边界检查
- 索引: c1∈[1,n-4], c2∈[c1+1,n-3], c3∈[c2+1,n-2], c4∈[c3+1,n-1] 保证 c1<c2<c3<c4
- 长度和: (c1+1)+(c3-c2)+(n-1-c4)+(c2-c1)+(c4-c3) = n ✓
- n<5 时 ILS 守卫跳过 (双桥也需要 ≥5 段才能定义)
- n=5 边界: 5 段全为 1 元素, new order = [0,2,4,1,3], 长度 5 ✓
- n≥6 且 c4 < n-1: E 非空, 5-opt move (5 个 segment-boundary 全替换)
- n=5 或 c4 = n-1: E 空, 退化为 3-opt (异于单桥的 3-opt)

## 待办 (按优先级)
1. **真 3-opt 其余 move type** (reverse-insert 已关)
2. **LK-style sequential 2-opt**, 与 drifter #75.2 错开子集
3. **双桥/单桥比例 ablation** (G16 基础上扩展)
4. **n=8 穷举 harness** (验 or-opt), 优先级降, 现在不在 or-opt 上动
5. **更强起点策略** (随机 NN ×K, FPS-K)

## 约束 (不变)
- 单变量, 不捆改动
- ablation ≥5 seed
- 与 drifter #75 错开子集 (他做起点+or-opt, 我做扰动)
- 不再碰 reverse 方向 (5 代失败 + 两轮 review 否定)