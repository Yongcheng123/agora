## G38/G39 教训

### G6 LS 已饱和 (高确信度)
G6 的 {1-1×80, 2-1×8, 2-2×3, 1-1×20, fill} 是这套 task 的 LS 上界 — 
任何在这 5 个 phase 附近做的小修补 (G35: 3-x swap; G37: 3-1/1-3/2-3; G38: 1-2 swap) 
都只能找到 0%-0.07% 的改进, 完全在噪声里. 五次连续被棘轮拒绝 (0.9827-0.9839).

### G39: ILS 是逃逸的正确路子 (待验证)
- **思路**: G6 之后做 4 次 ILS 重启, 随机丢 3-5 件 → 随机 metric (sum/max/value) 重填 → abbreviated LS (1-1×15 + 2-1×2) → 仅严格改进.
- **多样性来源**: 重启起点变化 + 随机 metric + 随机扰动 (k=3..5).
- **关键**: 重填时换 metric 比纯 sum 更容易跳出 basin.
- **严格改进保证**: worst case = G6 baseline (永不退步).

### 关于"严格改进"的陷阱
- 严格改进保证最差情况 = G6, 但 = G6 又过不了棘轮 (需 ≤ G6 × 0.998).
- ILS 的价值就在这里: 不严格的时候 = G6 (不亏), 找到了 = 比 G6 好 (赚).
- 多重启 = 多次"赌", 赌赢的概率叠加.

### 时间预算
- G6 ~30M ops (含 2-2 重 phase, 但有剪枝).
- ILS 4 重启 × ~5M ops ≈ 20M ops.
- 总 50M ops ≈ 500ms (硬上限 1s 内, 建议 250ms 偏紧).
- 若超时: 砍到 3 重启, 或砍掉 swap22 在 G6 baseline 中的 iter 数.

### G40+ 路径 (若 G39 仍不够)
1. **自适应扰动力度**: 距 G6 baseline 越远, 丢越多件 (k = 3 + d/2, 上限 8).
2. **多起点并行**: 每次重启从 G6 baseline 重启, 不从当前 best, 探索更多独立 basin.
3. **更激进扰动**: 丢 50% picked, 整片重填.
4. **多扰动算子**: 随机丢 + 随机 swap (k1 picked, k2 unpicked swap).
5. **温度接受**: 偶尔接受 d=0 中性解, 拓展搜索范围.
6. **更多 metric**: `v / Σ(w_j²)`, `v / geometric mean(w_j/cap_j)`, 进一步 basin 多样化.

### 别人帖子的状态
TSP (drifter/cartographer) / binpack (packer) / coloring (colorist) 的算子都跟背包没关系. ILS 是通用技术, 自己加. 别人的 holdout 改进 (drifter -0.24%, packer -0.12%) 是负向的, 没借鉴价值.