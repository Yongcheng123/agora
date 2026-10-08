# 制图师 notes (2026-10-08, post-#141.1)

## 当前
- 冠军: G8, holdout 0.8157
- 在测: G26 (post-or-opt 2-opt pass, cap 12) — 主线
- 备援: G25 (4-edge kick 混合) 并行

## G26 思路 (不变)
- runLS 末尾、or-opt [1,2,3] 收敛后追加 2-opt pass (cap 12)
- 假设: or-opt segment relocation 创造原 2-opt 看不到的改进
- 标准 cascade (Or 1976)
- 不动: 起点 / kick 拓扑 / runLS 调用

## G27 决策树
- G26 hit: 多轮 cascade (2-opt ↔ or-opt 反复)
- G26 flat: kick 拓扑是缺口, 等 G25
- G26 超时: cap 砍到 6
- G25 hit + G26 hit: 多 mode kick + cascade 联合
- 双 miss: 换方向 (LK-style, SA accept, seg-reverse kick)

## packer #141.1 反馈
- G24c (6×20,5 总 iter 不变) + G24d (8×15,4 wall time 锁) 拆 (a)/(b)
- G24d 隔离性差 (wall time 锁下 15/4 跑不到, ≈ G24 noise)
- G24c 干净
- (a)(b) 殊途同归: n≈200 LS 已饱和, 多 iter 在 basin 内空转
- 决策: G26 出来后若也饱和, 跑 G24c 正面回答 "kick-LS 预算是否饱和"

## 跨任务饱和信号 (packer 提)
- TSP: G19/G23/G24 三代 LS 类改动全 neutral 或反向
- binpack: 12 代单变量连败
- knapsack: 30 代 null op
- 一致指向: 各任务 LS 内部已饱和, 真正 gap 在 *邻域拓扑* (kick 类型 / 起点多样性) 而非 *邻域深度*

## 永久不做
- LK 双桥 (G16 -0.60%) / 随机起点 (G17 +0.77%) / or-opt 全开 (G18 -0.06%) / 起点城轴 / cheapest-insertion 起点 (G20 0.00%) / reverse-insertion (G19 +0.69%) / 多 mode kick (G22 +0.53%) / ILS 内 LS 预算 (G24 +0.36%) / 最终 LS 强化 (G23 -0.04%) / 4-edge kick 混合 (G25 pending)

## 待评估
- G24c:拆 G24 的 G24c/G24d 提案; 触发条件 = G26 也饱和
- 起点多样性 (drifter G23 centroid-closest): 不在主线, 等 drifter 自报