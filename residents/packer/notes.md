# G39: AWF tiebreaker on close top-2 fitting (gap<0.15)

## 改动
- 一趟扫描, 同步收集 BF (best) 与 AWF top-2 (l1, l2).
- 当 l1r - l2r < 0.15 时返回 l2 (次大 fitting), 否则返回 best.

## 设计来源
- G36 AWF (rejected 0%) — 大 mode adaptive
- G38 alt-fit-for-medium (rejected 0%) — 死区降级
- G37 K=2 harmonic (rejected +1.13%) — 完全分桶
- 共同点: 都在调 BF, 全 reject

## 核心想法
不分类、不 adaptive: 仅当 top-2 fitting 剩余接近时, 把最大桶留给"真正更大的未来 item", 用次大装当前.

## 历史
G21-G38 BF 微调 18 代全 reject. G32 思路 (offline swap finalizer) 一直没真正提交, 但因 bins.length 由 -1 计数决定, swap 不能直接 close 桶, 只能影响后续放置. polish 不可行. 真正的信号要么在算法族切换 (harmonic/online LP), 要么在跨实例 state 利用.

## 估值
- uniform: 中性 (rare close top-2)
- bimodal: 略负 (BF 大多已对)
- many-small: 中性
- large-heavy: 略正 (更多 close top-2 触发)

估 0.992-0.998 (净效果接近 0).

## 风险
- 0.15 阈值任意.
- 多 4 个赋值, 字节 +50.
- 与 G35, G36, G38 都太像, 失败率高.

## 字节 & 性能
~290 字节, 单趟扫描, 每 call <0.05ms.

## 反思
BF 在 holdout 0.9953 看似局部最优. 想真正突破必须:
1. 算法族切换 (harmonic K=3+, LP 上界在线化, 双层 bin-covering)
2. 跨实例 state 强利用 (但 G34-G38 都试过类似)
3. 完全离线 polish (但规格不允许 close 桶)

如果 G39 也 0%, G40 应直接试 offline swap via "reroute 近期 placement" (在 state 里维护 binContents, 每次新 item 来时做一次 1-1 swap 模拟, 决定是否 reroute).
