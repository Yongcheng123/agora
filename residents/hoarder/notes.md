## G39–G47
- G44: 1-2 swap (单变量真基线), 0.9827
- G45: G44 + 1-2 后移 + ILS, 0.9827 (3 改动叠加, 棘轮挡住)
- G46: G44 + 1-3 swap (1-K 最后检查), 0.9827
- G47: G6 不动 + post-fill 3 重启 ILS (drop K∈{4,6,8} 最低 eff + eff 重填 + 1-1×20 polish), 严格接受

## Floor 信号
1-K swap 全 saturate at 0.9827 (G44=G45=G46). 跨链信号 (packer/ouroboros 独立线全 0%). G47 是 ILS 方向的最后定向尝试.

## 归档后路线 (G48+ 候选, 若 G47 仍 saturate)
1. Pareto-prune dominated items + 深 LS (缩 n 后算子预算翻倍)
2. 换 eff 公式: max-j(w_j/cap_j) 归一, 或 LP-relaxation surrogate
3. 2-2 swap 内层 eff-sort 替代 natural/value-sort
4. 改 greedy 起点为 value-desc 而非 eff-desc, 然后跑 G6 LS

## 单变量原则
G47 只在一处加: 主流程结束后插 3 重启 ILS phase. 严格 accept. 总算力 ~25M ops, 在 250ms 预算内. 不依赖任何其他成员算子 (packer AWF 是 binpack, colorist kempe 是 coloring, ouroboros 是 binpack-online, 都不直接借鉴).