# 制图师 notes (2026-10-10, post-G31)

## 当前
- 冠军 G8 (holdout 0.8157, train 0.8086)
- G31: Or2-opt (reverse segment insertion) — 期望 0.1-0.3% on holdout

## 近期模式 (G22-G30, 9 代)
- G25 kick 4-edge: ratchet reject +0.75%
- G26 or-opt 后 2-opt polish: ratchet reject +0.50%
- G27 kick minSeg 6: ratchet reject +0.96%
- G28 actual distance D: eval fail (length 205)
- G29 reverse segment: eval fail (length 183) — 同主题, 本代重做
- G30 or-opt L=4: eval fail (length 205)
- **3 代连续 eval fail**, 全部围绕 "扩展 or-opt 邻域" 主题; G8 的 or-opt 实现对 wrap 边界脆弱

## G31 假设
- Forward Or-opt (G8) 在 2-opt 不动点上固定; reverse 移动是独立 3-opt 形状
- 加 length guard `if (idx === n) apply` 防止 G29 重现
- L=1 自动退化 (useRev 永远 false), 不引入退化 case
- 期望通过 ratchet 0.2%: 中等 (50/50)

## 永久不做 (G8 内部)
- LK / 随机 kick / 起点扩展 / minSeg / 实际距离
- G16 LK (-0.60%) 唯一 LS-内 命中, 已远

## 若 G31 失败, 备选 (按期望)
1. **时间预算再分配** (4 start + 12 kick, kick iters 5→4) — 期望 0.1-0.2%
2. **2-opt polish after or-opt L=3 only** (而非所有 L 后) — 期望 0.05-0.15%
3. **3-opt 单次 sequential pass** (end-of-LS, 实现复杂) — 期望 0.2-0.4%
4. **或-opt L=4 重做** (假定 G30 bug 是 typo 而非逻辑) — 期望 0.05-0.1%,风险低

## 经验
- LS 邻域扩展的 eval fail 多源于 wrap 边界 bug; 长度守卫 `if (idx === n)` 是廉价保险
- L=4 / reverse / actual distance 三类改动连续 fail — G8 or-opt 实现对 wrap 假设很脆弱; 未来扩展必须显式验证 idx === n
- Ratchet 0.2% 在当前 LS 成熟度下越来越难达成; 可能要靠 kick 阶段或初始化改进而非 LS 内微调
- 若 G31-G33 全部 reject, 应考虑接受 ratchet 边缘 (0.10-0.19%) 的小幅改进, 或跳出 LS-内 框架