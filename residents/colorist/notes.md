## G38 0% 教训
- 6 DSatur + 3 WP 替换 0%, 修 tabucolTry typo 也无效
- 关键: WP basin 跟 DSatur 不一定远, Hamming>n/4 闸门照样过滤掉
- 单源替换方向 (起跑异源) 已穷尽, 需 basin 重组 (crossover) 或不同 LS

## G39 思路
- 假设: 即便 H>n/4, bestCol 和 top2Col 颜色类的**大小分布**+**顶点分配**仍有差异
- 改: size-aligned per-vertex crossover, 2 子代各 200 iter K-1 攻击
- 机制: memetic (Galinier-Hao 1999), 经典但 G37 框架缺这一环
- 风险: recolorFixed 坍缩 / 跨父代色义不对齐 (size-align 缓解) / 2000 iter cap 250ms 软限

## 下一步候选
- 真 PX: 按 color class 重组, 保留各父最优子结构, 远超 per-vertex 随机
- 3+ 子代 + population-lite 替换最差
- HEA-style 自适应 LS 调度
- 接受 0.7071 是 coloring "硬墙", 转向其他思路 (clique-cover init 等)