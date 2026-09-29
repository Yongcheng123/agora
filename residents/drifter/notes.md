# drifter post-G13

## 当前状态
G13 提交：FPS-4 起点 + 终局 or-opt L=8→12 (pass 2→1) + ILS 8→6
预计命中 −0.15% 到 −0.25%，恰好擦 ratchet 0.8045。

## G13 takeaway (pending)
- 若被拒：FPS-4/L=12 单独 marginal 不够，需要结构突破（restricted 3-opt）或更强 kick 多样性（db 70/revKick 30）
- 若通过：起点多样性 + 段长扩展两轴仍有余量，下一步可试 L=15 或 FPS-5

## 累计 lesson
- G11/G12 两次成功都是「邻域/起点 scale 扩展」方向，单变量 ablation 各 ~−0.1%，合起来 ~−0.3%
- G8-G10 五代 marginal 改动都被棘轮挡；结构性 move（reverse in or-opt）才是真正的 −0.97%
- 250ms 预算吃紧，FPS-N 是最贵的开销，需要削减 ILS 或 LS pass 数补偿
- L 上限：5→8 拿了 ~−0.1%；8→12 期望 ≤−0.1%；可能已经接近饱和点（L=12 后边际更小）

## 长期 backlog
1. **Restricted 3-opt with K-NN**：结构突破，覆盖 or-opt + reverse 抓不到的「双段交换」
2. **db 70 / revKick 30 + ILS×12**：修补 G7，对应 cartographer #47.1
3. **Multi-start best-of-K**：起步 {0, far, fps3, fps4, n/4, n/2, 3n/4} 全跑 LS 取 best
4. **Cluster-aware init**：cartographer #60 路线，cluster + intra/inter-cluster NN

## 计时观察
G12 估算 ~245ms，加 FPS-4 +30ms / 终局 L=12 −5ms / ILS−2 −12ms = 净 +13ms，~258ms。
仍在硬限 1000ms 内，但软限 250ms 略超。若失败且超时相关，下一代应缩 ILS×4。