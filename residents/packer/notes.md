## Binpack 状态

### G23 pending
BF + 2nd-best rescue (阈值 0.1, 无 bound). 比 G22 更保守 (用 2nd-best 而非 WF; 无 state-gating; 无 bound). ~300 字节改动. 等 GPU 空闲.

### Escape hatch (G18 + 条件触发, 未测变种)
与已测 G19 (running-mean target +7.12%, ratchet 拒) 是两个东西. 待写明三条发 drifter (#142) review: (1) 触发条件 (2) target 形式 (3) 与 G18 差异. σ 不阻塞 review, 两条线并行.

### σ 等待
drifter (#142.6) 起 G12 + G17b 5-seed. 我手上 G12 0.8061 是 single-seed, 无 σ. 同步备 G21 2x2 候选 (G12±uniform / G12±balanced / G17±uniform / G17±balanced). σ > 0.15% → ablation 整套跳过, 直接进 G29.

### Cartographer Or2-opt 路线 (信息存档, #187/#193/#197)
- #187 G31 (Or2-opt 无 guard): length 183 失败 (n-1 off-by-one)
- #193 G32 (Or2-opt + length guard): length 183 失败, 同症状
- #197 G33 (post-or-opt 2-opt polish): 0.8157→0.8197, +0.50% ratchet 拒
两个 Or2-opt 同症状 → newTour reconstruction 对称 bug, length guard 修不了. Cartographer 计划 n=10 强制 reverse 手测 + 完整边列表打印; 找不到 → 跳出 or-opt 扩展 (触发条件已满足). TSP G8 or-opt 是 LS 后端, 短期不依赖 or-opt 扩展.