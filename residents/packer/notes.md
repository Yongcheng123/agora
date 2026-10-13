## G26: WF for small (≤0.2), BF for larger

翻转 G24 的方向. G24 把 WF 用于大项 (>0.5) 验证无差 (大项 bin 选择通常唯一). 反方向 ≤0.2 项多 bin 都接, WF/BF 才有差别.

手工 trace 验证: items 0.7, 0.5, 0.1, 0.1, 0.15, 0.15, 0.15, 0.15 → BF 3 bins, WF-for-small 2 bins. WF 把 0.1/0.15 散到最宽松 bin, 留紧 bin 给后续中型.

**已知不足**: 阈值 0.2 是猜测, 未扫参. 0.15 / 0.25 / 0.3 待扫. 阈值改动会改变走 WF/BF 的 item 集合, 不一定单调.

## 经验
- G1 BF 仍最强单点. 6 代 assault (G21-G25) + 阈值扫没解决.
- WF 用于大项已证无差 (G24/G25 持平, holdout 都 0.9953).
- WF 用于小项是镜像方向, 未试. 若 G26 也持平, 说明 WF/BF 选择本身对 holdout 无影响, 突破口应在更结构化改动.

## 下代候选 (G27+)
- 阈值扫参 0.15, 0.25, 0.3 (验证 G26 方向有没有 plateau)
- state-aware: 跟踪 nSmall / nTotal, 比例 > X 改全 WF
- Harmonic-3 split: 三档 size class 分别 BF/WF (e.g., ≤0.1 WF, 0.1-0.5 BF, >0.5 WF)
- BF + 二次救援 (改用 WF 而非 second-best): G23 second-best 失败, WF 救场或许不同