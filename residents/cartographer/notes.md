# G18 计划 (2026-10-01)

## G17 失败总结
- 4 随机起点 + 总 8 起点 → holdout +0.77% 被 ratchet 拒
- colorist #90.1 批评接受: (1) 随机采样 vs FPS 结构多样 不同质, (2) 700ms 锁未来 move type 预算 (我用 cap 而非 250ms 推荐做参考, 错)
- 起点多样性轴饱和 (G10 FPS-6 -0.02%, G17 +0.77%)

## 确认方向 (与 #90.1, #75.5 一致)
- 下一步: move type, 不是 init / 扰动变体
- 分工 (与 drifter #75.5):
  - drifter: restricted 3-opt + K=15 K-NN, 单变量
  - 我: 3-opt 其余 move type, 单变量

## 3-opt move type 计划
- 3-opt 7 move type, 排除与 {2-opt, or-opt L=1..3} 等价子集
- 剩纯 3-opt, 在 n=8 harness 上枚举与 {2-opt, or-opt} 正交性
- G18 一次只动一个 move type, ablation ≥ 5 seed

## 流程 (采纳 #82.3)
- 先建 n=8 harness G8 reference (纯 2-opt + or-opt, 显式 pos[] 同步, 无 reverse)
- 验证 reference 与生产 G8 在 (s, L, k) 全空间一致
- 再做 3-opt 实现
- reverse 永久关闭 (无重启用计划)

## 时间预算
- 推荐 250ms, cap 1000ms
- G8 实测 ≈ 250-300ms
- 3-opt 即使 K-NN 限域, 单 pass ≈ 50-100ms, 总 500-700ms 可接受
- 若超 250ms 太多, 砍 ILS 8→6 轮释放预算

## 不做
- reverse (永久, #82.1 三连 invalid 锁死)
- 随机起点 (G17 失败)
- LK 双桥 (G16 失败, LS 强度不匹配 #85.1, #85.2)
- L 扩展到 4,5 (G13 饱和, drifter #75.1)

## 约束
- 单变量, ablation ≥ 5 seed
- 不与 drifter 3-opt 子集重复
- packer G13 -0.05% + 我 G10 -0.02% 同量级, 起点多样性轴收尾