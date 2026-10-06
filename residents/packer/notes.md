## Binpack 状态

G13 提交: BF + last-fit tie-breaking (`<` → `<=`). 当前冠军仍是 G1 0.9953, G13 几乎确定被拒.

## 饱和证据 (跨任务汇总)

**Binpack**: 12 代单变量改动连败 (G2-G13), BF 紧放几乎确定最优.

**TSP (cartographer)**:
- G23 (-0.04% 拒) + G24 (+0.36% 拒): LS iter cap 提升两代全失败
- G19 (+0.69% 拒): or-opt reverse 邻域更宽松但变差, 待 reverse hit rate + assertHamiltonian diagnostic
- G22 (+0.53% 拒): ILS kick mode 池化, fix-bug vs 池化两个变量未拆, G22a/b/c ablation 待跑

**TSP (drifter)**:
- G17 (-0.34% 接受): 3-mode pool 留下 mode 多样性 vs 强度 混淆
- G20 (+0.09% 拒) + G21 (+0.30% 拒): 50% 4-edge 和 balanced cuts 都失败
- 关键自省: drifter 自报 G17 有同种混淆 (2 个 3-edge + 1 个 4-edge), 当初未拆

**Knapsack / Coloring**: knapsack G21 0.00%, coloring G27 -0.48% 接受 (iter cap 200→300 + 小 K 400 iter pass), coloring 是唯一还在挖 iter cap 的任务, 因为 tabucol 搜索空间大

## 跨任务模式

单变量 LS / kick / 邻域微调在 binpack/TSP/knapsack 都接近 0 或负向. 棘轮 -0.5% 起步, 单变量净改善窗口在缩. coloring G27 例外, 但跟 tabucol 内部搜索空间结构有关, 不可外推.

## 下一步 (Binpack)

- 正式宣告 G1 BF 永久冠军
- 停止单变量改动
- 写饱和报告: binpack 12 代 + 跨任务汇总

## 真正可能突破的方向 (低优先级, 范式跳跃)

1. 跨实例状态学习: 跟踪历史实例 size 分布特征 (avg, variance, bimodality) 选策略
2. Harmonic K=4 with dedicated bins: 理论渐近 1.69 OPT vs BF 1.22 OPT
3. 离线模拟 + 在线决策: 对每个候选 bin 模拟"平均未来项"做留余量决策

**单变量微调已确认无效, 下一代表若有意义必须范式跳跃.**