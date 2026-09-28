# drifter G10

## G10: K=20 candidate-list 2-opt + 加深搜索

### 改动 (相对 G4 单一方向)
- 2-opt 内层: 全 `n²` scan → 每个 i 扫 K=20 K-NN 候选
- 维护 `pos[]` 反向映射, flip 时同步 `[lo..hi]` 段位置
- 用省下预算加深: init 20→30 passes, ILS 5→8/轮, ILS 8→10 rounds
- K-NN list 一次构建; `d2` / `or-opt-1` / `db` kick / `NN(0, far)` / final `or-opt(3)` 全不动

### 机理
- 标准 LK 优化候选列表, n=200 时 K=20 内层从 ~200 砍到 ~10 (≈10× 加速)
- LK 文献: K=20 捕获 >95% 改进 (gain 大的 move 几乎都含短新边)
- `pos[]` O(1) 候选查; 退化 flip (`pk ∈ {i-1, i, i+1} mod n`) 严格比较跳过

### 时间
- 候选构造一次性 O(n²·K) ≈ 800K ops ≈ 5ms
- 2-opt 总时间 ≈ G4 的 30% (省 ~80ms)
- 总耗时估计 350-450ms (cap 内)

### EV: -0.10% ~ -0.30%
- 与 G8/G9 同方向 (加深) 但靠候选实现 5-10× **迭代预算增量**
- 棘轮 ~-0.21%, G8/G9 离阈值 ~0.04%, 有戏

### 风险
- K=20 漏边: improvement 新边都在 `t[i+1]` 侧而非 `t[i]` 侧, 标准 LK 接受
- 加深但 kick 不变, 后期 rounds 可能回旧 basin
- `pos[]` bug: flip 后忘更新 → 用过期 pk 算错 gain
- 退化 flip: 严格 `>` `<` 比较跳过

### 失败 fallback
- K=15 或 K=25
- `or-opt-1` 也换候选 (再有 ~2× 节省 → 堆到 ILS 14-16)
- 加 init 起点 (FPS-3 / +1 random NN)
- 引入混合 kick (snake+db+revKick 异构池)

### 累积 lessons (G3-G9)
- 单变量「强 kick」「深 LS」两个方向都卡 ~0.18% 棘轮外
- 缺一个机制把迭代数 3-5× 起来
- 候选列表正是这个 mechanism — 之前 8 代没碰 (自己首创)
- 若 G10 过棘轮: 下一步 候选 + 强 kick + 多 start 三联

### 单变量纪律
- G10 仅改 2-opt 实现 + 用其释放预算, kick / NN / or-opt 不动
- 失败时不回到已死的方向 (FPS-N, revKick, 单纯加深 round)
- 优先保持候选机制, 围绕它做调整