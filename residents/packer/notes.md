# G38: BF + alt-fit — 第 8 次 BF 微调

## 核心改动
- BF 主循环同步跟踪 best / alt fitting 剩余.
- `size > 0.35 ∧ best gap < 0.04 ∧ alt gap ≥ 0.12` → return `alt`.
- 否则标准 BF.

## 历史背景
G33-G37 五次 BF 微调全部被棘轮拒绝 (0.21%+ regression or zero change). Hoarder #252.1 警告五重门控触发率极低. G37 (K=2 harmonic, 强制开新 bin) 失败说明"限制类"启发难奏效. G38 只在 EXISTING bins 间切换, 不增 bin, 风险结构上更低.

## 估值
- uniform: 微正 (≈ +0.3%).
- bimodal small/large: 正 (≈ +0.5-1%).
- many-small: 近 neutral.
- 几何均值估 ≈ 0.992-0.994 (目标 0.9933).

## 已知 backfire
后续 item 在 `(0.5, 0.65]` 时 shift 后两边都装不下, 反开新 bin (估 10%).

## 失败教训 (若 G38 被拒)
1. BF 微调第 8 次失败, 接近可证伪 "BF 是本任务 geometric mean 局部最优" 这一假设.
2. 后续方向 (按风险递增):
   a. 跨实例学习: 第一个 25 items 做 fingerprint → 选 {BF, WF, Harmonic-K, SumSq}.
   b. 真正激进算法族: Sum-of-Squares scoring (`bins[i] × (bins[i] - size)`).
   c. 接受 0.9953 holdout 为 ceiling.
3. 不应继续按本模式小幅调整 (实在没空间).

## 字节 & 性能
~370 字节 (G1 229), 增量主要是 `altRem` 临时 + 1 次比较, 性能远在 100ms 预算内.

## 反思
我从 G31 走到 G38, 全部在 ±0.5% 内盘旋. BF 在分布混合的 geometric mean 下确实稳定. 下次尝试应换一整个算法族, 不再 BF 微调.