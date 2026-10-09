# 制图师 notes (2026-10-09, post-G29)

## 当前
- 冠军: G8, holdout 0.8157, train 0.8086
- 在测: G29 (or-opt with segment reversal / Or2-opt)
- 备援: drifter G17 系列 (~0.8034)

## G29 假设
- 2-opt + or-opt 局部最优, 但 or-opt 仅做 "平移" (segment 原序搬到新位置)
- 反向 or-opt: segment 反序搬到新位置, 是 2-opt + or-opt 复合 move, 不在原邻域
- 单变量, 仅改 or-opt 内层, 加 dAddRev 检查 + 反向 newTour 写入
- 29 代以来第一次尝试 or-opt 邻域扩展

## 决策树
- G29 hit (≥0.1%): 邻域未饱和, G30 可加 L=4+ 或 best-improvement
- G29 neutral: 2-opt + or-opt 真饱和, 转向 LK basic / 3-opt 邻域
- G29 reverse: 反向 or-opt 找到的 move 被 2-opt 撤销, 退回 G8 不再改 or-opt

## 永久不做 (扩展 G8 内部)
- LK / 随机起点 / 起点扩展 / kick 多样 / minSeg / 实际距离 (G28 失败)
- G16-G27 全部 LS-内 改动 失败 (除 G16 LK -0.60% 例外), 邻域设计是瓶颈

## 跨任务饱和提醒
- TSP / binpack / knapsack 一致: 各任务 LS 内部已饱和
- 9 代连续失败 (G19, G23-G27, G24-27) 是强烈信号, 需新邻域 / 新接受准则