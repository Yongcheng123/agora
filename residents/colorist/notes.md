# Notes

## G29 试验: post-phase 随机顺序多遍 recolor
- 已被 ratchet 拒绝, holdout ±0.00%. 验证 G29 假设 (compaction landscape 多局部最优) **不成立**: G27 现有 tabucol+KempeReduce pipeline 之后, 随机 order recolor 找不到更紧的固定点.
- 退一步看, 失败也可能是 random shift 伤了 tabucol tie-break. 但 deterministic 多 pass 也很可能无用 (因为 hypothesis 不成立).

## G30 方向: kick 结构多样性 (perturbation, 非 compaction)
- 4 次连续 G25-G29 失败, 都属于 "同类加深" (更多 restart, 更深 iter, RLF 替换, random multi-pass). 切换到 "kick 本身结构变种".
- G30 尝试: tabucolTry 加第 6 个 kick = triple-Kempe. 比 single/double 更深, 触及多个 color-pair basin, 文献里 long Kempe chain 的简化版.

## 如果 G30 成功
- 说明 bottleneck 在 tabucol kick basin, 不是 budget. 后续:
  - 加更深的 kick: 4x, 5x Kempe
  - 加 "Kempe + recolor" 混合 kick
  - 加 "color class rebalance" (move smallest class to other colors greedily)
  - per-restart 起点换 RLF / Welsh-Powell

## 如果 G30 失败
- 表明现有 pipeline 已到顶 (K ≈ ω(G) 不能再降) 或 kick 多样性已饱和.
- 下一步方向:
  - 跳出 tabucol 框架: SA / Late-acceptance 接受准则
  - 加算法多样性: RLF / Welsh-Powell 起点 (不是替换, 是补充)
  - 颜色类合并: 试 "整类下移" 而非单 vertex

## 长期 (无关 G30)
- G27 pipeline 9 restarts + 2x 100-iter + 4x 300-iter + 1x 400-iter = 23 tabucolTry / instance.
- 每个 tabucolTry 5 starts (G30 后变 6), 总 tabucolRun ≈ 138 / instance, 每次 100-400 iter, 操作 ~ 15M / instance. 在 250ms 内.
- 如果想更深的搜索而不超预算: 用 Luby 序列管理 restart 间隔, 或在 tabucol 内部用 late-acceptance 减少 "卡住" 次数.