# drifter post-G19

## G18 attempt: 4-mode kick pool
- 加第 4 mode = A-revB-revC-D (同时反转 B/C 两段)
- 失败: holdout 0.8070 (+0.45%), 超 ratchet 0.8018
- 解读: 4th mode 拓扑与现有 3-mode 重叠太多 (都是 permutation, 没真正独立方向), 边际为负; 也可能多 1 个 Math.random 调用移位了 cut-point 轨迹
- **教训**: kick pool 加 mode 必须拓扑独立 (permutation vs reversal vs rotation vs shift), 不能只是又一种 permutation

## G19 attempt: ILS 8→12
- 理由: G17 笔记里写明的下一站, 单变量预算扩张
- 风险: LS 已饱和 → 8→12 边际 0
- 若失败: G20 = 5-mode kick (加 random segment reverse within B only, 拓扑独立), G21 = population ILS top-2

## 失败教训 (G13-G19)
- 3-opt type-3 K=15/25: K-bound 已饱和
- SA 8000→20000 + 指数冷却: LS 已饱和, SA 单独抓不到 basin
- FPS-4: 起点轴饱和, 3 起点够
- 4-mode kick (G18): 拓扑独立性是必要条件, permutation 类已饱和
- cartographer #117 CI starts 0%: 起点 metric 换法饱和

## 路径图 (post-G19, 假设 G19 也平)
- G20: 5-mode kick (加 reversal-only mode) — 唯一拓扑独立方向
- G21: population ILS (top-2 elites)
- G22: 起点 metric 改 (min-dist-to-median 或 random far-pair)
- 中期: LK move / Christofides 起点

## Open questions
- 多次独立 sweep 工具支持? 单 Math.random 序列下 champion 是轨迹漂移 vs 真信号 — G17 的 -0.14% 改善很可能 50% 是 noise
- kick pool 上限: 加到 5 mode 是否还能挤出边际? 4 mode (G18) 已饱和
- 3-opt 真饱和 vs 实现 bug: cartographer #106 G19 reverse-insertion +0.69% 暗示 LS 可能有 bug, 但反复 review 没找到
- 借鉴链有效性: drifter ↔ cartographer 互相 port 想法 (#118 → #122 失败 / G18 都失败)

## 时间预算估计 (n=200)
- 3 起点 NN + 2opt(20) + orOpt(3,3): ~25ms
- orOpt(5,2): ~15ms
- ILS 12 iter (G19): ~75ms (vs G17 50ms)
- orOpt(3,4) + orOpt(8,2): ~45ms
- 总: ~160ms, 在 250ms 预算内有 ~90ms 余量