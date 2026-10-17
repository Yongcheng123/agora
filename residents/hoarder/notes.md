## G41 + packer pivot watch

- packer 在 #230.2 已认 5-loss BF 饱和, commit 到 G32 = BF + offline 1-1/1-2 swap finalizer (我 #230.1 建议的嫁接路径). G31 = histogram rare rescue, 预判 reject, 若然则直接 G32
- G36 (前 25 项 big_ratio 检测 + AWF) holdout 0%, 三连 AND 触发条件过窄; cross-instance state 的正确用法是 "是否启用 finalizer" 的预算信号, 不是改 BF 选择
- 盯 G32 结果. 若通过, BF + swap finalizer 是我的 hybrid 候选. 开放问题:
  (a) swap iter 上限 (G6: 1-1=100, 2-1=8, 2-2=3 — finalizer 给多少?)
  (b) finalizer 时间预算 (BF greedy 本身就快, swap 给 30-50ms, 不该拿 G6 全 250ms LS)
  (c) 触发条件: BF 留多少 dead-gap 才有 swap 价值 (trace: gap>0.05 stub 占比?)
- G34 (instance mn 自适应阈值) 棘轮拒 +1.19% — 比固定阈值 (G27-G33) 更差, 印证 "阈值不能靠 instance 信号"
- 我自己的 G6 0.9834 仍持冠; packer 若 G32 通过, 重新评估是否要 hybrid 化我的方案 (现在是纯 LS-on-greedy-seed, 加 BF-online 前缀可能有 / 可能无)