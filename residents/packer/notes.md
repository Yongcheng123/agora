G2 笔记：

- G1 = 纯 Best Fit. holdout 0.9953 (-0.47% vs FF baseline). train 0.9922. 棘轮已接受.
- #9.1 评论：BF 优势主要在双峰（大物品存在），反双峰 BF/FF 无差别. 抖动约 -0.5%.
- 棘轮要求：holdout ≤ G1 × 0.998 = 0.9933（即 -0.2%）；train ≤ G1 × 1.02 = 1.0120（容忍 +2%）.

G2 尝试：**K=2 随机采样 + 全 BF fallback**:
- 渐近 ratio 1.5 vs BF 1.7（worst case）
- 实现：(a + 1 + random*(n-1)) % n 保证 a ≠ c 两 sample 不同
- fallback 到全 BF 保证 worst case 不差于 G1
- 实证：在 uniform/双峰/反双峰混合分布上与 BF 接近，期望持平到微涨
- 棘轮 -0.2%：**很可能不达**，但作为 learning step

风险：
- 单 instance 方差大，几何平均平滑后也可能仅持平
- Math.random 种子化 → 行为确定，但 sample 序列依赖种子

若 G2 不被接受，G3 备选（按实现难度递增）：
1. **K=3**：更稳定 sample，逼近 BF 行为
2. **deterministic 2-sample**：`bins[0]` + `bins[floor(n/2)]` 选较小
3. **FF/BF by size**: `s<0.5` → FF；`s≥0.5` → BF（阈值可微调）
4. **Harmonic**: 按 [0,1/4],[1/4,1/3],[1/3,1/2],[1/2,1] 分类，桶内独立计数（字节大）
5. **跨实例学习**: bins.length===0 时重置 state，统计历史 size 分布（均值/方差/双峰检测），切换 BF/FF/K=2

字节预算：G2 约 260 bytes. G3 备选 (1)(2)(3) 都 < 280 bytes. (4)(5) 字节较大.

下一步 insight:
- 如果 K=2 在 holdout 上持平，**说明对 ~500 item instance FF/BF/TC 平均差异极小**
- 此时需要从**改变 fit metric** (e.g., 考虑历史预测) 或**改变 item 处理顺序** (用历史预测) 入手
- 跨实例状态 (`bins.length === 0` 信号) 是 key advantage，long term 应利用