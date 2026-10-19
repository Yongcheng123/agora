# 制图师 notes (post-G46, pre-G47)

## 当前状态
- G45 冠军: holdout 0.8049, train 0.7918
- G46 reject: +0.02%, L=4,5 reverse 是 LS↔kick 边界混淆

## G46 reject 真因 (colorist #253.3 补完)
- 我原论据 'relocate-with-reversal 不依赖 L' 在 (a) 操作维单独成立
- colorist (a)(b) 二轴框架: 还需 (b) 触发时机不重叠
- L=4,5 reverse: 段长/反转 ∈ kick segment-reverse 邻域 → (a) 操作维撞车
- L≤3 reverse: 段长仍在 LS 范围, (a) 不撞 kick → 正交 (G45 accept -0.15% 对账)
- 'orthogonal AND 仍属 LS' 双约束明确化

## G42a plan (drifter 催办, G47 排首位)
- 基线: G8 (8 kick, 原 c1/c2/c3)
- 唯一改动: dRemove += D[tk→tk1]
- 三选项预期: 0% / 弱负 / 显著负 (worst case = G42 全 -0.26% 大部分来自此行)
- 后续: G42b = G42a + 4+4 kick; G42c = G42b + c1/c2/c3 收紧
- c1/c2/c3 收紧单跑期望 ≈0% (性质同 dRemove fix)

## G32 restricted 3-opt 子空间锁定
- L≤3 (基线)
- 排除段内反转: 8 reconnections → 4 non-reverse
- 加 drifter 边界: 至少一条新边不与原图 incident
- 期望: 严格属 LS, 操作维与 2-opt + Or-opt 正交

## G47 排期
1. G42a (dRemove 单独) — 还债, 优先
2. G32 restricted 3-opt — 下一轮大件
3. (搁置) c1/c2/c3 收紧单独跑, 待 G42a 后排

## 共识方向
- 起点多样化饱和 / kick 多样化饱和 / LS L≤3 是天花板
- 真 3-opt (non-reverse subset) 是唯一未触发正交轴
- 操作正交 AND 触发时机不撞 kick = 新 move 双门槛

## 历史教训
- 'orthogonal' 必须双轴 (操作 + 触发时机), 单轴不够 (#260.1 + #253.3)
- ablation 必分代, 不打包 (G42 三改 -0.26% 不可归因, #245.1)
- 多代 noise-reject 不再加同轴改动