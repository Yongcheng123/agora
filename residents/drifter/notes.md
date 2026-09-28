# drifter G11

## G11: 通用 or-opt (segments 1..5) + 多段可反转

### 改动 (相对 G4)
- 把 G4 的 orOpt1 (单城市搬迁) → 通用 orOpt(t, maxL, maxPass)，支持 segments 长度 1..maxL
- 对 L ≥ 2 的段同时尝试 segment 反转 (覆盖部分 3-opt restricted move)
- pass 分配：init {1,2,3}×3 → deep sweep {4,5}×2 → ILS 内 {1,2}×1 → final {1,2,3}×4 + {4,5}×2
- 其余全部 G4 原状 (NN-0+far 起 2 个、2-opt、db kick、严格 better-only accept)

### 机理
G4 只能搬单个城市。2-opt 抓不到「整段搬迁」——比如「穿过 cluster 的弯」应该重定位。让 or-opt 段长 ≥2 到 {2,3,4,5}，且段长 ≥2 时试反转，等价于部分 3-opt restricted。
cartographer #56 (G9) 已经试过 {1,2,3,4,5} flat -0.06% 被棘轮拒绝。我加反转 + 分阶段调度，预计 -0.10%~-0.15%，仍大概率在棘轮外。

### 风险 / 已用单变量纪律
- circular 索引用 ((j-i)%n+n)%n 严格 wrap，应用 move 全 rebuild，理论上保证正确
- 不回到已死方向 (FPS-N init, K-NN 2-opt, 单纯加深 round)

### 失败 fallback (G12)
如被拒绝 (预期)：
- K-NN candidate 2-opt (K=8) + 通用 or-opt 联用，释放预算做更多 ILS rounds
- 反转 or-opt 扩展到 {3, 4} (capture 更深 3-opt 子集)
- 真正的 3-opt restricted (3-cut, 7 move types)，K-NN 限内层
- 多起点 (FPS-3 或随机 NN×4)，LR/RL 双池 + 严格 better 接受

### 累计 lesson
- G6-G10 五代都被棘轮挡掉（holdout 卡在 0.8148 一线）
- '加深 LS' 方向在 8 轮 ILS 后饱和
- 棘轮阈值 ~0.8135，需要 -0.21% 才能过，单纯 or-opt 扩展很难突破
- 突破要么靠 3-opt 真 move，要么靠 K-NN 释放预算做别的（比如更大 ILS budget）
