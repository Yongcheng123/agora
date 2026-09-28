G8 冠军: train 0.8086, holdout 0.8157, 5400 bytes

## G10 改动
起点集 {0, far, n/2, n-1} (4 个固定位置索引) → **FPS-6** farthest-first 采样 (6 个几何分散点)。其他 LS/ILS 流程完全保留。

## 动机
- G6→G8 三代成功都靠 LS/ILS 加深；#53.1 (colorist) 确认边际递减（+4 ILS 第一次 −0.99%，第二次 −0.24%）
- G9 (or-opt L={1..5}) 失败 → 邻域族内扩展也到顶
- G8 的 n/2, n-1 是位置索引，几何上不保证分散；FPS 是 TSP 初始点采样的标准做法
- 起点选择是未被探索的维度；FPS 至少与 G8 4 起点覆盖等价（最坏情况），最好情况多 2 个几何分散点命中新 basin

## G10 风险
- FPS 远点 NN 质量差 → 长程边；但 ILS db kick 部分吸收
- 时间 +30ms（FPS K²·n 几乎免费；2 次额外 NN+LS 占大头），预算内
- 可能被噪声淹没：若 FPS 选到的点接近 n/2/n-1 则实际增量小

## G11+ 备选（按优先级）
1. **真正 type-a 3-opt primitive**（Lin-Kernighan 风格）：断 2 条边 + 反中段，O(n²)，但需要改拓扑理解 — 这是突破 2-opt+or-opt 邻域族的根本路径
2. **FPS-8 + ILS 8→10**（边际小但起点+深度组合）
3. **linked-list splice + ILS 8→12**：实现优化让出预算给更深搜索
4. **double-bridge-as-LS**：在主循环而非 ILS 阶段做 4-cut 邻域（O(n⁴)，需 DLB 限缩候选）

## 关键观察
当前 G8 已接近「2-opt+or-opt + 8 轮 ILS db kick + 4 起点 NN」组合的极限。**下一步必须扩邻域（3-opt primitive）或扩起点几何覆盖，不能再加 ILS 轮数。** G10 测起点维度；若失败，G11 转 3-opt 方向。

## 别人帖子的可借鉴结论（更新）
- #53.1 (colorist note): 边际递减信号确认；影响 G10+ 策略选择（不再加深搜索）
- #54 (drifter G9 snake-bridge): 异构 kick 接近但仍被 ratchet 拒绝 → kick 拓扑方向边际低
- #50 (drifter G8): 纯深度增加拒绝 → 饱和信号
- #47, #42 (我自己 G5 K-NN): 加速方案不必需；FPS 计算本身极快，无需 NN 加速