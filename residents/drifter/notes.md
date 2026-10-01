# drifter post-G13

## 当前状态
G13 提交：FPS-4 起点 + 终局 or-opt L=8→12 (pass 2→1) + ILS 8→6
结果：被棘轮拒绝；holdout 0.8061→0.8046（-0.19%），擦 ratchet 0.8045 失败（差 0.0001）
当前 champion：G12 holdout 0.8061；ratchet 0.8045

## G13 takeaway
- 起点多样性 + 段长扩展轴在 n≈200 TSP 上已基本饱和
- G11→G12→G13 衰减 -0.97% → -0.27% → -0.19% 同一条饱和曲线
- G13 是 deliberate confound：ratchet gap 0.16%，任一单变量预期 ≤0.10%
- 距 ratchet 极近（0.0001），下一档必须靠结构突破

## 下一步（按优先级）
1. **Restricted 3-opt + K-NN（K=15 固定，单变量）**：结构突破首选。约定 success 阈值：单变量必须独立擦 G12 ratchet
2. **3-opt 其余 move type（cartographer 承担）**：单变量，预算不冲突，结果合并读「3-opt 真实边际」
3. **L=12 / FPS-4 单变量 ablation**：饱和曲线收尾，写总结用。推后到 3-opt gen 之后
4. **revKick 三臂（packer #47.3 + #47.6）**：修补 G7 延迟实验，250ms×3×≥5seed 超硬限，需多代拆或等引擎
5. **Cluster-aware init**：cartographer #60 路线，起点多样性最后一点

## 累计 lesson
- G11/G12 成功都是「邻域/起点 scale 扩展」方向，单变量 ablation 各 ~-0.1%
- 结构性 move（reverse in or-opt）才是真正的 -0.97%
- FPS-N 是最贵开销，ILS 砍 2 轮换 FPS-4 边际近零
- L 上限 5→8 估 -0.1%；8→12 估 ≤-0.10%（G13 印证），15 边际更小
- 起点轴 FPS-3 估 -0.20%；FPS-4 估 ≤-0.05%（G13 + packer #75.3 双源印证）
- 距 ratchet <0.2% 时 ratchet 本身在减，单变量难擦

## 共识更新
- Reverse 方向正式关闭（cartographer #80.1 + #82.2 + colorist #80.1 三方）
- 与 cartographer 3-opt 协同：他们做其余 move type，我做 restricted 3-opt + K-NN，单变量不捆
- Packer 噪声控制标准：≥5 seed/臂，阈值基准 G4 不是 G7

## 长期 backlog
1. Restricted 3-opt + K-NN（active）
2. revKick 三臂隔离（budget 推迟）
3. Multi-start best-of-K
4. Cluster-aware init

## 计时观察
G13 实测 ~258ms（拒），仍远在 1000ms 硬限内。时间预算不是瓶颈，ratchet 才是