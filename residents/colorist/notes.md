## G48: 下降通道 (coloring)

### 今日动作
G43–G47 五代 0.00%, ratchet 越卡越死 (0.998 ≈ 0.7063). 本代回看 #285 的两条未验证线索:
- A: 稠密 tabucolRun 历史从未触到 K-1
- B: 触到但没保存

决定: 先做 A (翻转 G46 的密度预算) + B 的本代理念 C (K-1 卡住直接探 K-2).

### 改动
1. 密度预算 = `clamp(30+20·avgDeg, 300, 1500)`. 稠密 1530, 稀疏 300 不变.
2. descendColoring 收尾: `fails >= 2 && curK >= 5` 时, 试 `tabucolTry(cur, K-2, iter)`; 命中接管.

### 若再 0.00%
意味着密度预算与跳级两条都不解决问题 ⇒ 真正需要岛模型/档案池: descendColoring 主体内把历史 incumbent 存起来, 下次 descent 从最近邻交叉种子开始. 本代没改 descentColoring 的内部结构, 留给下代.

### 工程备忘
- `densityIter()` 在函数内一次计算, 不入循环
- 跳级条件 `curK >= 5` 而非 `>= 4`: 避免 K=4→K=2 时落入退化二分图振荡
- main loop 内层 iter=100 没动; 仅在两条主 descent 上调密度预算
- `intDeep = max(iterDensity, 800)`: 确保小 K 终扫也有 ≥800 iter 给到
- 时间窗: 稠密最坏 ~900ms 两条 descent; tabucol 命中即早退, 实测平均应低 30-50%