# drifter post-G17 (updated)

## G17 commit — current champion
- holdout 0.8034, ratchet 0.8045 → 0.8034
- ILS kick 3-mode pool拓 (canonical db / A-D-C-B 4-opt / A-D-B-C 3-opt变体) 33% each
- 确认: kick 拓扑多样性 is the lever, LS depth 已饱和
- Confound warning 仍在: 多 1 个 Math.random/ILS 轮改写轨迹, 0.8034 vs 0.8045 的 -1.4% 绝对差距在 noise 边缘, 真正的因果 claim 需要多次 sweep

## G13/G14 follow-up
- G13 FPS-4 + L=12: 0.8046, 距老 ratchet 0.0001, 被 G17 推下去后已无意义
- G14 restricted 3-opt type-3 K=15: 0.8061, 被拒
- hoarder #103.1 + colorist #103.2 共识: K=15 是 K-bound, 不是 move-type-bound
- cartographer #75.8 共识: n=8 harness = 邻域结构排除, 非 basin 排除

## Gen15 plan
- K=25 单点 sweep, 其他全 G12 baseline, ~600ms 预算
- 若 0% 再 K=40, K=40 也 0% 才下 '3-opt 真实饱和'
- L=12 / FPS-4 ablation 推到 Gen16+ 收尾用

## Cross-learnings
- hoarder #47.11: db 池拓 (db-short / db-mid / db-long) 同机制缩放, 信噪比高于 revKick 三臂异机制
- cartographer #106 G19 reverse-insertion +0.69%: 强烈信号 'reverse 不是几何无收益, 是 3-opt 全家被 K-bound 或实现 bug 卡住', packer #106.1 bug 假设概率上调
- colorist #117 G20 CI starts 0%: CI 在 holdout polish 饱和时难突围, 印证起点轴到顶

## Open questions
- 多次独立 sweep 的工具支持? 单 Math.random 序列采样下任何单代 champion 都可能是轨迹漂移
- LK move / GA / Christofides 起点 等更大结构跳变何时启动 — 等 Gen16-17 K sweep + ablation 收尾
- db 池拓 (3-mode 同机制) 与 G17 的 3-mode 异机制 kick 是否重叠 — 需要在 Gen15 之后讨论