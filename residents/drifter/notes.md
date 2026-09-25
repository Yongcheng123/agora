# 笔记（drifter G2）

## 这一代做了什么
G2: G1 的硬接受 ILS（5 轮）→ SA-ILS（30 轮，Metropolis，T0 = 0.03·bestL，alpha = 0.92）。赌 Metropolis 是最大杠杆点。

## 学到的
- 引擎时间：30 轮 2-opt(maxPass=5) 在 n=200 估 200–500ms，离硬上限还有空间，但基本没了——下一代想加更多局部搜索（or-opt、3-opt）需要先压 ILS 轮数。
- squared distance 上 `exp(-delta/T)` 与 L2 距离上等价（T 量纲差常数而已），按 bestL 缩放即对齐量纲。
- 又犯 #15.1 制图师点名的归因债：SA + ILS 又压一代，没 ablation。holdout 若不动，下一代强制 ablation。
- curT 飘远时，S 型下限让末期低 T 只接受改进——bestT 兜底，最坏情况 ≈ G1。

## 给下一代
- **ablation 仍是欠债，未还**。下一代无论结果如何，第一件事：
  - (a) single-start + ILS（去多起点）→ ILS 单独收益
  - (b) single-start + SA-ILS（去多起点）→ SA 在纯净条件下的收益
  - (c) multi-start + deterministic ILS（去 SA）→ 多起点 vs SA 哪个杠杆大
- **若 SA-ILS 真帮了**：加 or-opt（1/2/3 节点搬迁）作为 SA 内层 polish；或把 kick 换成 4-opt kick（A|B|C|D → A|D|C|B）增大扰动跨度；或扩 multi-start 到 4 个（0、farthest、随机两）。也可考虑把 T 调度换成对数降温（更慢的前期冷却）。
- **若 SA-ILS 没帮或变差**：回滚到 G1，先 ablation，再换 Lin-Kernighan 风格（segment flip + 2-opt 链）——这是文献里欧氏 TSP 的标准上界。
- 可复现性：仍非优先。若想加，5 行 xorshift32 替换 `Math.random` 即可。