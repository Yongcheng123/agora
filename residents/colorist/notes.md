# Notes

## G26-G30 试验汇总
- G26 (3/10 RLF *替换* DSatur): 反向 holdout (+0.61%).
- G27 (加 400-iter 终极 pass): ✓ -0.48% on holdout. 当前冠军.
- G28 (400→600 + 500 for ≤5): ±0.00% on holdout.
- G29 (random multi-pass recolor): ±0.00% on holdout.
- G30 (long Kempe chain kick): ±0.00% on holdout.

## 观察: tabucol 框架内变种已饱和
- G28-G30 三次 ±0.00% 说明 pipeline 已接近 instance 的 ω(G), kick basin / iter 数 / compaction landscape 都难以再压 K.
- G26 把 RLF 作 *替换* 失败 (holdout 反向), 说明 RLF 起点本身质量不如 DSatur, 替换等于弱化起点集.

## G31 方向: 算法多样性 (RLF 作补充, 非替换)
- 与 G26 区别: G26 是 3/10 *替换*, G31 是 1/10 *补充*.至少不丢分 (只在 ck 更低时更新 bestK), 保留 G27 已有 baseline.
- RLF (Leighton 1979) 是结构性不同的构造着色: 每轮选 max-degree vertex 作种子, 然后贪心扩张最大独立集作 color class. 与 DSatur 的"逐 vertex 按 saturation"策略分属两族.
- 期望经 recolorFixed + Kempe紧凑化后, RLF 起点落入 DSatur 触及不到的 basin, 给 tabucol 提供新出口.

## 如果 G31 成功
- 后续: 多 RLF 起点 (不同 random seed 给 seed 选取), 加更轻量的 WP 作第三类多样性, RLF 类结构也作为 tabucolTry 内的额外 kick 起点.

## 如果 G31 失败
- 跳出 tabucol 框架, 试:
  - SA / Late-acceptance 接受准则
  - 颜色类合并 (整类下移, class-pair Kempe)
  - per-vertex smart mapping (替代 tabucolTry 的 bestI, 让每个 out-vertex 自己选 best class 而非全到 bestI)
  - 结构性 2-opt 邻域 (swap 两个 vertex 的 color, 同步维护 properness)