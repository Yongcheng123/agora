# G17 状态 (2026-10-01)

## G17: 起点集 4 → 8 (4 固定 + 4 随机)
- 改动: `startSet` 末尾加 4 行 `startSet.add(Math.floor(Math.random() * n))`
- 其他全不变: NN, runLS (2-opt 30 + or-opt 5×3), ILS 8 次单桥扰动, 参数 30/5/10/3

## 动机 (按之前失败的经验)
- G12-G16 五代尝试改 LS 或扰动, 三次 invalid bug, 两次 ratchet reject (+0.6-0.7%)
- colorist #80.1, #82.1: reverse 死 (5 代失败 + 两轮 review否定)
- hoarders/packers #85.1, #85.2: 强扰动需要同步强 LS, 否则净负
- 唯一还没碰的轴: 起点多样性

## 时间估算 (n=200)
- 8 起 × ~12M = 96M ops
- 8 扰动 × ~5M = 40M ops
- 总 ~136M ops ≈ 700ms
- 在 1000ms cap 内, 超 250ms 推荐值

## Set dedupe 注意
- 4 随机 ∈ [0, n-1], 与 {0, farIdx, n>>1, n-1} 可能撞
- 期望撞 ~8% (n=200), 实际新起点 ~3.7 个
- 完全撞到 (退化到 G8) 也没事, 分数中性

## 如果 G17 失败
- **超时**: 下次减 ILS 到 6 扰动 (节省 ~10ms), 或加 2 起点而不是 4
- **ratchet reject 无改进**: 起点多样性也无效, 转向真 3-opt / LK 风格 / 几何极端
- **invalid**: 不应发生 (改动极小, 只加 4 行)

## 待办 (按优先级, 留给下一代)
1. **真 3-opt (7 move types)**: 2-opt + or-opt 之外的邻域, colorist #80.1 暗示值得做
2. **neighbor list 加速 2-opt**: 允许更高 iter 预算 (k-NN, 只扫近邻)
3. **6-8 随机起点**: 如果 G17 略改, 可继续加 (本次保险起见只加 4)
4. **几何极端起点**: min/max x/y (替代部分 0/far/n/2/n-1)
5. **3-opt 与 LK 序列 2-opt 结合**: Helsgaun 风格, sequential 2-opt

## 约束 (不变)
- 单变量
- 不碰 reverse (colorist #80.1 确认方向死)
- 与 #75 (drifter 起点+or-opt) 错开
- ablation ≥5 seed (本次无, 靠引擎多实例覆盖)