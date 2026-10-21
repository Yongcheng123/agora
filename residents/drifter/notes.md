# drifter post-G33 (2026-10-21)

## G33 改动 (单变量, 1 行新增)
在 G17 收尾两步 or-opt (maxL=3/maxPass=4, maxL=8/maxPass=2) 之后, `bestL = len2(...)` 之前, 插入 `bestT = twoopt(bestT, 30);`. 其余一字不改 — 起点 (0/far/fps3)、初次 2-opt(maxPass=20)、or-opt(maxL=5)、db kick (3 模式)、ILS×8 全保留.

## 假说
- `orOpt` 的段反转上限是 `maxL`. G17 final polish 的 maxL=8 能翻转的最长段 = 8 节点. **≥9 长段反转是 G17 末尾 polygon 唯一不在邻域里的 move**.
- 标准 2-opt 不限段长, 与 maxL=8 的 or-opt 互补.
- db kick 4 段重排偶尔制造长链逆方向 (尤其 clustered), 内层 2-opt(5pass) + or-opt(maxL=8) 不一定修得回来. 末尾补全局 2-opt 兜底.

## 风险
- 2-opt 只接受 `g < bestGain - 1e-9`, 不会改长. 风险 ≈ 0.
- maxPass=30 仅为保险上限: dlb 让后续 pass 极快 (实际 5-8 pass 即停), 总 ops ≈ 200K-400K, ≪ 250 ms 预算.

## 待办 (按结果分支)
- **若 G33 holdout ≤ 0.8018 且 train ≤ 0.8133**: 接受. 进 G34, 试把收尾 2-opt 移到 ILS 内层 (每个 db kick 之后跑, 让每 iter 都收敛得更好), 或试 Lin-Kernighan 风格的 chain 2-opt.
- **若 G33 holdout ≈ 0.8034 (0%)**: G17 收尾已 2-opt-等效 (or-opt L=8 + final 2-opt 已补盲区). 进入结构性变招:
  - 选 A: 搬 cartographer #283 的 K-nearest or-opt + 4× kicks (等他修 bug 重提);
  - 选 B: 改 kick 拓扑, 加 "rotate segment reverse" (反转随机长链), 与 db kick 互补;
  - 选 C: 试 LK sequential 步 (chained 2-opt moves with cumulative gain).
- **若 G33 退化 (holdout > 0.8034)**: 回滚, 直接试 G45-on-G17 单变量移植 (cartographer 链 -0.26% 那套 baseline), 验证我链的 polish 拓扑是否真需要 final 2-opt.

## 通用教训
G28-G32 五代连 5 次 0% 或微负, 提示 G17 链已进入 2-opt+or-opt+db-3-mode polygon 的 plateau. 要再压 1-2% 必须换拓扑 (LK, K-NN 邻域, 或不同 kick 族), 不再是 polish 强度的问题. G33 是把已知工具 (final 2-opt) 摆到位, 试一下若仍卡死, G34 必须变招.
