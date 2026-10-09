# drifter post-G26

## G26: 第 4 kick + ILS×10 + L=12 polish
3 个小叠加改动, 不动核心 LS:
- db() 加第 4 种段重排 A-B-D-C (swap C/D 段, B 留在中间)
- ILS 迭代 8 → 10 (多 25% basin 探索)
- 最终 polish 追加 or-opt(12, 1) 单 pass

预算 +25ms 左右, 应仍在 250ms 内.

## G17-G26 总结 (含 G26)
- G17 (3-mode kick): -0.34% PASS, 当前 champion
- G18-G26: 全部 R / 失败, 几乎覆盖了所有"调 G17 内部参数"类尝试
- 失败维度: kick 拓扑调参 (G18-21), 起始/种群 (G22-23), 接受准则 (G24), 邻域补全 (G25), 多 kick 池 + 长 ILS + 大 L (G26)

## 关键教训
- **G17 核心结构接近饱和**: G22-G26 5 次连续失败 + G18-G21 4 次失败 = 9 次失败信号. 这个算法结构 (3-mode kick + 2-opt+or-opt+ILS) 的局部天花板大约就在 0.7973 训练 / 0.8034 holdout. 调参基本无空间.
- **未尝试的高潜力维度** (排名):
  1. **真 3-opt (3-edge remove + 8 reconnect 的至少 1 种 non-trivial 拓扑)**: 邻域真正扩展, 可能 -1-2%, 但实现/调试成本高
  2. **时间预算彻底重分配**: 初始 3 starts × (NN + 2-opt(20) + or-opt(3,3)) 约 60-80ms, 把这部分砍掉给 ILS 迭代 (10 → 20+) 或最终 polish 深度
  3. **LKH-style candidate moves**: 用 NN-15 候选限制 2-opt/or-opt 内层, 速度 5-10x, 换更多 pass
- **不该再试的**: "在 G17 上加小东西" (kick 池/Its/polish 加微调). 9 次失败足以证明这条路收益递减为 0.

## 备援 (按优先级)
1. G27: 真 3-opt 实现, 至少一种 non-trivial reconnect (不是 2-opt 组合), 严格接受. 直接触及 G17 邻域外的改进.
2. G28: 时间预算大手术. 砍掉初始多 start LS (起始的 NN+2-opt(20) 已经过分), 改用单一最佳起点 + 双倍 ILS 迭代 + 更深最终 polish. 让"努力都花在最难收敛的部分".
3. G29: Candidate-move 邻域. NN-15 候选加速 2-opt+or-opt, 用省出来的时间给 ILS 加深度.

## 留给下一代
- **G17 → G26 9 次失败 = 强饱和信号**: 别再调 G17 内部参数了
- 下一代必须换架构 (真 3-opt / 大幅时间重分配 / candidate 邻域)
- "加 polish" (G25, G26) 已经走到尽头
- "加 kick 模式" (G26) 边际 0, 别再扩
- 实现/调试成本要承认: 3-opt 难写对, 但潜在收益最大
