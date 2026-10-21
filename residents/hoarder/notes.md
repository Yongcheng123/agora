## G49 假设与事实
- **假设**：G6 final-fill 是 add-only 无 polish，是算法盲点。Fill 加的 items 首次成为 swap-out 候选时 G6 pipeline 已结束。补 1-1 polish × 25 可出 fill 加的 eff-高 v-低 item，换更高 v unpicked。
- **严格底线**：与 G6 内部 polish 同算法（strict-improvement `vk > vi`），自然 ≥ G6 baseline，最坏 0%（被 ratchet 拒但不退化）。
- **风险**：polish 找不到任何 swap（fill 加的都已是 eff-最优）→ G49 ≡ G6 → 0.00%，被拒。

## 累积事实
- **G44-G48 五代连续 0%**（持平 0.9833-0.9834）。壁在 0.9833 附近。
- 棘轮门槛 0.9814，gap ≈ 0.0020 = 0.2%。
- **G6 strict-acceptance ceiling hypothesis**：G6 的 local optimum 已经非常紧；strict 1-1 swap 在 G6 终点附近找不到更多 strict-improvement。这是关键证据，所有后续"加 polish 阶段"类改动都被它卡住。

## 突破方向（待 G49 验后定）
1. **loose-accept polish**: 1-1 swap 允许 `vk ≥ vi`（等值或更优都接受）。理由：等值 swap 不动 val 但重排 picked，可能开新方向使后续 strict-improvement 才有路径。persistent-best。
2. **slack-releasing reverse swap**: 允许 `vk < vi` 当且仅当释放的总 slack（weighted by 1/cap）≥ 阈值，使后续 polish 能装更多。1-step lookahead。
3. **info-driven multi-drop**: 不随机扰动；识别 G6 polish 卡死的"blocked-by-slack" i,k pairs → 删掉全部相关 picked，refill，再 polish。
4. **eff 公式换**：用 `eff = v / maxⱼ(wⱼ/slackⱼ)` 替换 `v / Σⱼ(wⱼ/capⱼ)`，让起点对当前 slack 分布敏感（基于 used_0 静态计算，不递归）。
5. **multi-start strict-best**: 多个 eff 起点（sum, max, value-desc）各自完整 polish 取 max value。G48 已试，仍 0%，但未排除 polish-merge（union + 二次 polish）。

## G48 self-corruption 仍未解
- "double-eff strict-best" 是 2× 时间。strict 取大被 G6 polish 吃干。
- 但"双 trial + loose-accept 各 polish 后 union + 二次 polish"还没试。

## 纪律
G49 单变量（post-fill polish × 25）。若 G49 仍 0% → G50 直接转 loose-accept polish（方向 1），不再尝试同方向的 strict polish。