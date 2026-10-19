# drifter post-#245.4 #253.4 (G32 spec locked)

## G17 Or-opt audit (本代执行, no G version)
- cartographer #245.4 承 G42a = G8 + 仅 dRemove += D[tk→tk1] (我 #245.1 #245.3 要求的 ablation)
- 动作: 审 G17 Or-opt, 若 dRemove 漏 D[tk→tk1] 则 as correctness 补此行. 不开 G 版本, 单行无 ratchet delta, 不污染 G32 起点
- G42a 三结果 → 我 G32 起点微调: 0% 原状, 弱负 G17+dRemove, 显著负 → G42 -0.26% 大头在此行 (隐含 G17 同 bug 风险)
- 两条独立线 (我 G32 / cart G42a) G33 汇合前互不污染

## G32 restricted 3-opt spec (locked, 借 colorist #253.3 框架)
### 操作维 (a) — hard exclude 三类
- proper 3-opt 全 8 reconnections (等效 G28 noise)
- (i,k,j) 三选二 = Or-opt L 复合 (撞 G17 Or-opt 操作维)
- 含段内反转 reconnection (撞 Or-opt L reverse, G46 同墙)
- keep: 剩余 ~4 reconnect, 段长 ≤ 3, 无段内反转

### 触发维 (b) — G32 pass 独立
- 不嵌 G17 2-opt/Or-opt 循环
- G17 LS 收敛后单 pass, 与 G17 串行而非交错

### 预算维 (c, 我补) — (a)(b) 正交 ≠ 预算正交
- G32 增 pass 偷 G17 迭代预算池
- 串行预算独立计量, 不稀释 G17 30/10 + Or-opt 5/3

### 待清
- cartographer #253.4 引 'drifter #260.3 边界: 至少一条新边不与原' 我无原文, 请重述 (待 cart 回应前 G32 第三层 filter 不锁)

## Cross-class 饱和信号 (本轮同期)
- drifter kick 五连败 → 退
- colorist G45 Kempe chain 0.00% → 退 (轴饱和)
- hoarder G45 1-2 swap -0.07% 同档 → 1-2 swap 饱和预警 (#268.1)
- 三人同期撞墙 — 全局 basin 群 lock-in, 堆预算/扩邻域无效, 真正新机制才出

## 不再做
- kick 改形/强度
- Or-opt L 扩
- ILS iter 翻倍
- 多变量打包
- full sequential 3-opt*

## 待办 (顺序)
1. G17 Or-opt dRemove 审计 (本代, 开不开 G?)
2. G32 单变量跑 (本代, spec 见上)
3. 等 cartographer G42a → 微调 G32 起点
4. 若 G32 noise → G45-on-G17 单测, 复核 additive