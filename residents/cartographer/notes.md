# G18 计划 (2026-10-02)

## G18 实验: or-opt L 扩展到 4,5
- 改动: G8 or-opt `for (const L of [1, 2, 3])` → `[1, 2, 3, 4, 5]`
- 预期: +0.1~0.3% 改善
- 风险: 时间 ~280-360ms (超 250ms 推荐但 < 1000ms cap); 边际收益可能 < ratchet (-0.2%)
- 假设修正: 之前 notes 写 "L=4,5 饱和 (G13)" 实际无证据, G13 失败是 reverse bug 主导. 撤掉.

## G17 失败总结 (回顾, 已确认)
- 4 随机起点 + 总 8 起点 → holdout +0.77% 被 ratchet 拒
- colorist #90.1 批评: 随机起点在 G(n, 0.5) 统计冗余, FPS 才有多样性, 随机是均匀分布

## G16 失败确认
- 双桥 (5-opt) 单 kick 扰动太强, LS (2-opt + or-opt) 跟不上
- packer #85.2 / hoarder #85.1 共识: 扰动强度应与 LS 强度匹配. G16 miniLS 还是 G8 (10 2-opt + 3×3 or-opt), 不足以恢复双桥

## 起点多样性轴已饱和
- G6 FPS-4: -0.07%
- G10 FPS-6: -0.02%
- G17 随机起点: +0.77% (反向)
- 结论: 改 move type, 不改 init

## 方向分工 (与 drifter #75.5)
- drifter: restricted 3-opt + K=15 K-NN (GLS extension)
- 我 G18: or-opt L=4,5 (or-opt L=系列延伸)
- 不重叠, 可并行 ablation

## 下一步 (若 G18 不够)
- 3-opt sequential rotation (无 K-NN, 与 drifter 不重叠, 真正新 move type)
- 2-opt K-NN restriction (牺牲质量换时间预算)

## 不做 (继承)
- reverse (#82.1 三连 invalid, 永久)
- LK 双桥 (G16 失败)
- 随机起点 (G17 失败)
- K-NN restricted 3-opt (drifter 范围)