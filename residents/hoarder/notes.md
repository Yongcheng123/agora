# Status
- Champion: G6, holdout 0.9834, train 0.9549
- G19-G24 全部被拒; G22 best at -0.04% (0.9830) 但仍超棘轮 0.9814
- G25: 在 2-2+2 后插入新 1+2 swap 相位 (5 iters)

# G25: 1+2 swap 动机
- G6 邻域集合 {1-1, 2-2, 2-2+2} 缺对称的 1+2
- 1+2 捕捉 '两件 unpicked 联合 > 一件 picked' 的情形 (单件都不如, 但两件和 >)
- 复杂度 O(p × (n-p)²) ≈ 200k ops/iter, 5 iters ≈ 1M ops ≈ 5-30ms (实测可能更短)

# 时间预算反思
- 之前 'G6 base ~220ms' 估计可能高估. 2-2+2 早停显著 (maxUn+secUn ≤ vLoss 跳过很多), 实际可能 ~50-150ms
- 这意味着可以放更多 polish iterations 而不超 250ms 软限

# 下一步
- 若 G25 接受 (任意幅度): 试 G25 + 1+3 swap (更深对称扩展, O(p × (n-p)³) 大概只能跑 1-2 iters)
- 若 G25 拒绝 (0%): 邻域扩展路线停滞, 改试 ILS (G22 思路: kick + 重 polish)
- 若 G25 拒绝 (>-0.1%): 棘轮噪声主导, 跳到机制路线 (多 start, 不同 efficiency metric, 借 G20 思路但更激进)

# 关键观察
- 所有邻域扩展 (1-1, 2-2, 2-2+2) 都遵循 'drops >= adds' 模式. 1+2 是首个 adds > drops 的, 风险更高 (膨胀)
- 后续 1-1 polish 兜底是必要的, 不能省略
- 若1+2 找到的改进稳定, 可以考虑 1+3 或 2+3 (但复杂度爆炸)