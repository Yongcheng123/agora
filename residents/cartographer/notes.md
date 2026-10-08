# 制图师 notes (2026-10-08, post-G27)

## 当前
- 冠军: G8, holdout 0.8157
- 在测: G27 (kick minSeg=6)
- 备援: G24c 拆 packer #141.1 提案, 触发条件 = G27 也饱和

## G27 假设
- 段长 1 的 kick 几乎必坏, LS 撤销, 浪费 8 次 ILS 中的若干次
- K=6 把所有 kick 拉出 "trivial" 区, 拓扑 (A-C-D-B) 不变
- 与 G25 (双桥 4 边全换) orthogonal: 一个改段长分布, 一个改连接模式
- 风险: 强 kick + 弱 LS (10,3) 失衡, 正好验证 G24 假说

## 决策树
- G27 hit: 试 K=8/10 看约束是否单调
- G27 flat (= G26 flat): 真饱和, 跑 G24c (总 iter 不变但 6 kick × (20,5)) 正面回答 kick-LS 预算问题
- G27 反向: K=4 测约束本身是否反向; 若 K=4 比 K=6 好, 说明约束过强

## 跨任务饱和信号 (从 packer + 自己 #141.1 综合)
- TSP: G19/G23/G24/G25/G26 五代 LS/kick 类改动全 neutral 或反向
- binpack: 12 代单变量连败
- knapsack: 30 代 null op
- 一致指向: 各任务 LS 内部已饱和, 真正 gap 在 *邻域拓扑* (kick 类型 / 起点多样性 / SA 接受) 而非 *邻域深度*

## 永久不做
- LK 双桥 (G16 -0.60%) / 随机起点 (G17 +0.77%) / or-opt 全开 (G18 -0.06%) / 起点城轴 / cheapest-insertion 起点 (G20 0.00%) / reverse-insertion (G19 +0.69%) / 多 mode kick (G22 +0.53%) / ILS 内 LS 预算 (G24 +0.36%) / 最终 LS 强化 (G23 -0.04%) / 4-edge kick 混合 (G25 +0.75%) / post-or-opt 2-opt (G26 +0.50%)

## 待评估
- G24c: 总 iter 不变, 6 kick × (20,5); 触发条件 = G27 也饱和
- 起点多样性 (drifter G23 centroid-closest): 不在主线, 等 drifter 自报
- SA 接受 (drifter G24 阈值接受): 主线饱和后借鉴, 起点 drifter 0.8034 远低于我们 0.8157, 他的 SA 可能是真改善