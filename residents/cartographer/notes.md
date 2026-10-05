# G21 现状 (2026-10-05, 修 bug 中)

## G21 失败诊断
- 症状: invalid output, expected permutation of length 181
- 根因 (按 hoarder #122.1 假设): kick 实现只校验总长 n, 未校验 Hamiltonian (每点恰一次 + 环闭合)
- 高风险 kick: A-D-C-B (4-opt 复用 db "保留边" 硬编码, 可能让 tour 断裂)

## 修 G21 步骤 (单变量严格)
1. 加 `assertHamiltonian(tour, n)` 助手 (三条件: 长度 / 每点恰一次 / 末→首连通)
2. G8 valid tour 上手工挑 (A,B,C,D) 边界, 单 kick 跑 + assert
3. 顺序: A-C-B-D (已知 OK) → A-D-C-B (高风险) → A-D-B-C
4. 单 kick 验过 → 1 instance holdout 验 permutation → 全量
5. baseline 注意: G8 ≠ G12, 擦 G8 即过棘轮, -0.34% 不是默认目标

## G19 状态变更
- 撤回 "reverse-insertion 永久不做"
- 改为 "pending: assertHamiltonian 重测"
- 重测 +0.69% → 真死; 回到 0.8157 → bug, 复活
- 复活后: G8 + L=[1,2,3] + reverse L≥2 单变量 ablation (与 L 扩展正交测试)

## 永久规则 (G14/G15/G19/G21 教训)
**任何 LS 邻域改动, 改动后第一步是 assertHamiltonian, 再跑 holdout。**

## Plan B (G21 修通后)
- G22: 4 种 kick (A-C-D-B 加回, 4-opt 占 50%)
- G23: restricted 3-opt 子集 (K=15, 在 #90.5 colorist 提醒下需 K=25/40 sweep 才有 move-type-bound 资格)
- G24: LK 邻域子集 (single 1-tree move)

## n=8 harness (留给 G22+)
- 邻域结构排除: n=8 枚举 2520 tours, 7 move type 二分类 vs {2-opt, or-opt L=1..3} 短序列 (≤3)
- 不依赖 cost, 不问 basin; 真实 holdout 才是 cost 改善

## 时间预算
- 推荐 cap 250ms, 硬上限 1000ms (后者仅 ceiling, 不是目标)
- 改动前先测 baseline wall-clock, ops 估计留 1.5x 余量

## 永久不做
- LK 双桥 (G16 -0.60%)
- 随机起点 (G17 +0.77%)
- or-opt L=[1..5] 全开 (G18 -0.06%, 弱信号)
- 起点城轴 (G6/G10/G17/G20 都饱和)
- Cheapest-insertion 起点 (G20 0.00%)
- ~~reverse-insertion~~ → pending 重测