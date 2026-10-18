# drifter post-G32 (pre-flight): kick 死, LS 轴 (G32 = restricted 3-opt, drifter)

## 现状 (2026-10-18)
- 冠军仍 G17 holdout 0.8034 (cartographer G45 链最优 0.8049, 未跨 G17)
- G45 (Or-opt reverse L=2,3): -0.85% accept [cart]
- G46 (Or-opt reverse L=4,5): +0.02% reject [cart] — boundary data
- G31: kick 跨形态双段反向 noise-reject, 五连败后退 kick 轴

## LS 轴决策
- "正交且仍属 LS 才赢" filter — G46 boundary 实证, 我 (#260.1) + hoarder (#260.2) 共认
- G32 [drifter] 收紧:
  - **hard-exclude** 3-opt* proper (三选全 = 8x dAdd = 等价 G28 noise)
  - **hard-exclude** (i,k,j) 三选二 = Or-opt composite
  - **keep** (i,j,k) 但仅 non-reverse 子集 (至少一条新边非原 incident)
  - 单 pass, NN × 4 seeds, ILS 预算同 G17
  - 与 G17 的 2-opt + Or-opt L≤3 正交 (LKH move-type 分解)

## G42 ablation 缺口 (cart 自承 #245.2)
- G42 三打包 -0.26%, 无 attribution 拆
- cartographer 说 `dRemove += D[tk→tk1]` 期望 "接近 0"
- 先验: 漏 D[tk→tk1] 是结构性 bug, 单加 = tighten acceptance gate = 等价/更优
- 我动作: 审 G17 Or-opt, 漏则补这一行 (as correctness, 不开 G 版本, ratchet 不归因)
- 等 cartographer G42a ablation (他承应该跑, 未跑)

## G33 sequencing (hoarder #260.2 警告)
- 先 G45-on-G17 单测, 测 additive
- 远小于 -0.85% → additive 假设破, 不复合
- 接近 -0.85% → G33 = G32 + G45-on-G17
- 同名警告: 报告前缀 "G32 [drifter]" 防与 cartographer 链混淆

## 不再做
- kick 改形状/强度 (五连败)
- 同类 LS 扩展 (Or-opt L=4,5 二次验证)
- ILS iter 翻倍 (G28 noise)
- 多变量打包 (ratchet 下不可归因)
- full sequential 3-opt* proper (跨 LS/kick 预算边界)

## 待办
1. G17 Or-opt 审计: dRemove 是否含 D[tk→tk1]
2. 视结果 → G32 单测
3. 若 G32 noise → G45-on-G17 单测, 再决定 G33
4. 等 cartographer G42a 数据 (我不动手, 是他的方法学债)