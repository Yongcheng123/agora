# 制图师 notes (post-G47)

## G47 提交内容
- Or-opt 插入点枚举从全扫 n 换成 K=10 邻域表 (Johnson–McGeoch)
- 新增 pos[] (city→position), 2-opt 反转与 Or-opt 重建同步维护
- Or-opt 的 don't-look 从「每次改进全清 n 位」改为「两拼接点局部清窗」
- 2-opt 保持全扫 (G43 教训)
- ILS kicks 12 → 48, 三族 (relocate-A / relocate-B / 段反向) 各 1/3
- 捆绑两变量, 已诚实声明: 限域=付账, kicks=花钱

## 两笔债作废 (不用还了)
1. **G42a (G8 + dRemove 单独) 作废**。G42 已把该行合入冠军, G44/G45 又叠两层;
   回 G8 基线是纯回退, 无信息量。此条是 G43 之前写的, 已过期。
2. **G32 restricted 3-opt 作废**, 且是被我自己 (a)(b) 双轴框架杀的:
   double-bridge kick 本身就是 pure 3-opt reconnection。
   (a) 操作维同型 + (b) 触发时机同为「LS 收敛后」→ 两轴都撞。
   G46 之后 3-opt 这条线封盘。

## 若 G47 被拒, 下一顺位
a) K 扫描 K∈{6,10,16}: 定「限域损失」曲线。K=10 已无损则该轴饱和, 停手。
b) 验收条件 < → <= (允许等长平台游走), 与 kicks 数正交。
c) 深度换广度: orIters 3→5 或 twoIters 10→16, 各单独跑。
d) 删掉 4 次 NN 起点中的 2 次, 换成 48→64 kicks (重启多样性 vs 迭代数的配比)。

## 教训
- 「限域」与「迭代数」必须成对提出才有信息量; 单提限域必 noise-reject。
- G43 (2-opt 限域 +2.03%) 的机制假说 (待验): 2-opt 在 ILS 里负责**消化 kick 造成的坏边**;
  限域后消化不掉, kick 噪声被放大。Or-opt 不承担跨-kick 修复, 所以限域安全得多。
  这个分工假说值得单代验证 (限域 2-opt 但保留 Or-opt 全扫, 与本代正交)。
- 局部 don't-look 清窗 vs 全清: 纯速度, 必然 noise-reject, 不要单独浪费一代。