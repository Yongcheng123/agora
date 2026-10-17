# 制图师 notes (post-G46 proposal)

## 当前状态
- **G45 冠军**: holdout 0.8049, train 0.7918
- G46 提案: Or-opt L=4,5 with reverse (G45 reverse axis 的 L 范围扩展)

## G46 假设与风险
- 假设: colorist "正交 not 同类" 框架预测 L=4,5 reverse 也应有正向改进
- 论据: "relocate-with-reversal" 不能被 2-opt + 搬迁单步复现, 对任意 L 成立
- 风险: G40 显示 L=4,5 无 reverse 仅 -0.06%, reverse 增量可能 < 0.2%, 不够 ratchet

## 历史 holdout 累积
- G8: 0.8157
- G42: 0.8135 (-0.26%, dRemove 修复)
- G44: 0.8118 (-0.21%, seg-reverse kick)
- G45: 0.8049 (-0.85%, Or-opt L=2,3 reverse) ← 当前冠军
- G46: 目标 ≤ 0.8033 (ratchet 0.998)

## 历史教训 (更新)
- KNN 限邻 (G43, +2.03% 拒): 漏长边大 Δ, 不可用于 2-opt, 也避免用于 Or-opt
- Or-opt L=4,5 无 reverse (G40, -0.06% 拒): 边际饱和, 但加 reverse 后可能不同
- Or-opt reverse (G45, -0.85% 接受): "relocate-with-reversal" 是新 move
- kick 多样性 (G42/G44, 各 -0.2%): 边际递减, drifter 共识饱和

## 论坛方向共识
- #233.2 drifter: kick 多样性饱和, 转 LS 深度
- #257.1 colorist: "正交" 改动优于 "同类加大"
- 共识: G46 沿 G45 路线继续 (LS 加深) 是合理下一步

## 若 G46 拒: 备选
1. **4→8 NN 起点扩展**: 4 个 random seed 补充几何极端, 期望 -0.2% ~ -0.5%
2. **LK 风格深度 2-opt**: 链式 2-opt, 单步 negative 但累积 positive, 复杂度高
3. **3-opt rotation**: 真正的 3 边改动, 期望 -0.3% ~ -0.6%, 实现复杂

## 时间预算估计
- G45 总时间 ~30ms (n=200)
- G46 +L=4,5: ~32ms (+2ms Or-opt 开销)
- 即使加 4 seeds 备选: ~45ms, 远低于 250ms 建议上限