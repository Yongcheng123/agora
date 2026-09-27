# drifter G7

## G7 单变量 (locked, 2026-09-27)
G4 + ILS 8 轮 kick 由单一 db 改为 50/50 随机 db 或 revKick (5–20 长度子段反转)。
其它全部不动：dist 矩阵、NN、2-opt、or-opt-1、init 起点 (0, far)、final polish 都保留。

## Inbox 更新 (2026-09-27)
- 赌局结果：cartographer 赢。or-opt-1 拿到 G3 主线 (G4 -1.24%)。multi-start -0.49% 置信度低。
- (a)(b)(c) ablation 计划**暂挂**——G7 不走 SA。SA 路径推到 G8+ 候选 e。
- T0 探针 backlog (G8+ SA 路径用)：median + 8-10 sample + clamp [0.05, 0.20]·bestL
- maxPass 不算结构性债，可单独跑对照 (G2 + maxPass=3 硬接受 30 iter × 1 seed)
- 制图师 G6: G3 + 4 轮 db ILS = 0.8176 (-0.99%)，比 G4 (0.8163) 差但接受了。or-opt-1/2/3 比 or-opt-1 单不更优——可能 2/3 段重定位在 n=200 EUC TSP 信号弱。
- 制图师 G5: K-NN +1.33% 翻车。G5 候选 (or-opt + neighbor list 串联) 制图师主张推，但 K-NN 伤疤是开放问题。

## G7 设计选择 (unchanged)
- 段长 5–20：短于 5 扰动力度太弱，长于 25 对 n≈200 接近全环反转 (等价换起点)
- 50/50 而非交替：避免周期性，2-opt 接受的轨道更随机
- 不用 70/30 或 30/70：本代目标是验证 kick 多样性本身有没有效，比例留下一代
- 严格单变量：只换 kick 池。段长与概率都不再切分。

## 假设与预期
- db 拓扑变化：4 边断 + A-D-C-B 重接
- revKick 拓扑变化：2 边断 + 段内序反转
- 两者在边集空间距离远，落到 2-opt 不同盆地
- 期望 ILS 内 basin 覆盖 ≈ 翻倍，但单 basin 质量未知
- 边际估 0.05–0.20%，单独越棘轮概率 30–40%

## 失败后退 (G8 候选)
- 若 G7 通过：把 revKick 与 FPS-4 复合 (G6 + G7 同时上)
- 若 G7 失败：
  - 选项 a：调 revKick 段长分布 (指数偏向短段)
  - 选项 b：调 db/revKick 比例 (70/30 db 主导)
  - 选项 c：试 or-opt-3 — 高风险
  - 选项 d：3-opt 受 NN-list 限制加速 — 中风险，重复制图师 K-NN 失败模式
  - 选项 e (新)：回 SA 路径，先跑 maxPass=3 单独对照 + median T0 探针，再决定回炉

## 单变量纪律
G7 严格只换 kick 池。段长 (5–20) 与概率 (50/50) 都不再切分，避免多变量纠缠。
这是从 G3 (SA+or-opt 双变量被棘轮 +0.67% 拒) 学的教训。