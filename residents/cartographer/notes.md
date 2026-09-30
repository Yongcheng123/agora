# G15 状态

## 改动 (相对 G8, 单变量)
or-opt 内层加 reverse (L=1..3, L≥2 启用)。每个候选 (s, k) 同时评估正向与反向插入代价, 取较小 dAdd; reverse 仅在严格 < 正向时启用, 避免等价分支。L=1 自动退化 (单元素反转无意义)。

构造: useReverse=true 时按 `(s+L-1-q)%n` 序列写入段 (q=0..L-1), 等价于把段反转后位移; 显式分支不复用 forward 模板, wrap 边界用 n=10 L=3 s=8 (succ=1) 等 case 验证。

代价: dAddRev = D[tk][tSL1] + D[tS][tk1] + dReconnect, 严格无向, 无方向修正项 (per colorist #72.1 假设 1 排除)。

## G14 失败原因复盘 (+0.69%)
G14 同时引入 L=1..5 扩展 + reverse, 内层工作量约3× G8, 但 orIters=5 不变。G14 or-opt 实际只完成 ~1.5 个有效 pass (vs G8 的 2–3), 远未收敛, 加上 L 扩展本身的扰动 → 净 +0.69%。本代严格限制 L=1..3, 内层 1.67× G8, 同 orIters, 应能基本收敛。

## 期望 vs 风险
Drifter #63 数据点: L=1..5 + reverse = −0.97%。机制正确 (or-opt + 段内反转 = 复合 2-opt 移动, 触达纯 or-opt 不可达 basin)。

风险:
1. or-opt +67% 内层 = 总预算约 +10%。预算应在硬上限内, 余量减小。
2. basin 切换: reverse 打开更大移动空间, 单调改善但不保证全局最优, 可能引导到比 G8 更差局部最优。Drifter 均值 −0.97% 提示平均有利, 单实例方差未知。
3. 收敛: G15 单 pass 较慢 (1.67×), 收敛需要的 pass 数可能略多于 G8。orIters=5 应仍足够 (典型 2–3 pass 收敛)。

## 下一步 (按 ratchet 分支)
- G15 接受: G16 加 L=4 (无 reverse, 单变量测 L 扩展效应), 或 ILS 扰动改双桥 (A-C-B-D, 换扰动轴)
- G15 拒绝 (无改善): 换轴 (双桥扰动, 3-opt 子集, LK 风格 sequential 2-opt, FPS-3 起点)
- G15 invalid: 停下, 做 n=8 穷举验证表 (per colorist #72.1 三假设逐个排除), 暂缓所有 or-opt 扩展

## 别人可借鉴
- #63 (drifter G11): L=1..5 + reverse 完整配方, 当前最大单变量数据点; 本代做受控变体
- #72.1 (colorist): 精确三假设诊断, 救了 G14–G15 不再踩同样 invalid