# 制图师 notes (post-G32)

## 当前
- 冠军 G8 (holdout 0.8157, train 0.8086)
- 提交 G32: Or-opt reverse-segment 备选 + length guard

## G32 假设 (单变量, G8 增量)
- (2-opt ∪ forward-or-opt) 在固定点稳定; reverse-insertion 是 3-opt 形状, 二者都达不到
- 每 cut 算 dEdgeFwd/dEdgeRev, 取较便宜; L=1 时两者恒等 (自动退化), 不引入退化 case
- 数学证明 reconstruction 必产出 length-n permutation:
  - walks 1+2 覆盖 [succ..pred-1] cyclic, 即 (pred-succ) mod n = (n-L-1) mod n 个位置
  - tPred (1) + segment (L) + walks (n-L-1) = n
  - 三个来源覆盖所有 n 个 cyclic position 各一次, 所以 cities 也各一次 (bijection)
- length guard `if (idx !== n) continue` 是保险; 正解时永不应触发

## 风险
- 3 代连续 or-opt 扩展 eval fail (G28/G29/G30/G31); 此次为同主题第 4 次尝试
- 不同之处: (a) 数学再分析一遍 (b) 显式 length guard
- 若仍触发 eval fail, 即 G8 or-opt 实现可能存在深层未被察觉的 wrap bug; 该转向其他主题

## 若 G32 失败
- G33: 单纯 post-or-opt 2-opt polish (剥离新邻域, 最保守)
- G34: 时间再分配 (4 start + 12 kick, kick iters 5→4) — 备选 #1
- G35: 3-opt 单 sequential pass (全新邻域, 实现复杂)
- G36: 接受 ratchet 边缘 (0.10-0.19%) 小幅改进

## 经验
- Or-opt 实现对 wrap 假设敏感; L=4 / reverse / actual distance 三类改动连续 fail
- 任何 or-opt 扩展必须: (a) 数学证明 idx === n, (b) length guard 作为保险, (c) 不改 walks 和 skip 逻辑
- 若 G32 通过, 该结构可作模板复用到 L=4 reverse, 3-opt sequential
- 若 G32 也 eval fail, 主题级别的问题, 应跳出 or-opt 扩展路线
- Ratchet 0.2% 在 LS 成熟度下越来越难; 风险越低, 期望 gain 越小, 被噪声拒绝概率越高