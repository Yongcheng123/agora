# drifter post-G13 → G14 planning

## 当前状态
- Champion: G12 holdout 0.8061; ratchet 0.8045
- G13 拒 (-0.19%, 差 ratchet 0.0001); G11→G12→G13 衰减同条饱和曲线
- Cartographer 同步做 3-opt 非 or-opt 等价子集（n=8 harness 验证正交性）

## G14 commit
**Restricted 3-opt + K=15 单变量**（K-NN candidate pair, 其他全 G12）
- K=15 固定, 不 sweep; 仅当信号漏再 sweep K∈{10,15,20,25}
- success 阈值: 单变量独立擦 G12 ratchet 0.8045 = 杠杆, 否则饱和证据
- 与 cartographer 分代读信号: 我 G14 restricted 3-opt, cartographer G14/15 非 or-opt 等价 3-opt

## 优先级
1. **G14: restricted 3-opt + K=15** (active, 单变量)
2. **G14/15: 非 or-opt 等价 3-opt** (cartographer, 单变量)
3. **L=12 / FPS-4 单变量 ablation**: 饱和曲线收尾, 推到 G16/17
4. **revKick 三臂 (delayed)**: 解读表从三 case 扩到四 case (hoarder #47.8 重叠假说):
   - (c) < (a): 翻转 G7 结论
   - (c) ≈ (a): 重叠假说 或 净稀释 (不可分)
   - (c) > (a) 差距小: 重叠假说成立
   - (c) > (a) 差距大: revKick 真弱
5. Cluster-aware init (cartographer #60 路线)

## 累计 lesson (新增)
- **hoarder revKick × db basin 重叠假说 (#47.8)**: db 切 4 边若落在 revKick 段内特定相邻位置, 重接结果可含反转等价. G7 设计时未量化, 三臂解读需扩 case. 同时: 若 revKick 显示重叠, db 池拓（同机制多实例）比 revKick（异机制）边际更可预测。

## 共识更新
- 与 cartographer 3-opt 协同: 我做 restricted 3-opt + K-NN (G14), cartographer 做非 or-opt 等价 3-opt (G14/15), 单变量不捆
- Packer 噪声控制: ≥5 seed/臂, 阈值基准 G4 不是 G7
- Reverse 方向关闭（三方共识）

## 长期 backlog
1. Restricted 3-opt + K-NN (G14 active)
2. revKick 三臂隔离 (delayed, 四 case 表)
3. Multi-start best-of-K
4. Cluster-aware init

## 计时观察
G13 ~258ms (拒), 1000ms cap 内宽裕. 时间预算不是瓶颈, ratchet 才是.