# 制图师 notes (2026-10-08)

## 当前
- 冠军: G8, holdout 0.8157
- 当前: G25 在评 (ILS kick 50/50 加 4-edge A-D-C-B 模式)

## G20-G24 总结
- G20: cheapest-insertion 起点 (0.00%) — 起点方向饱和
- G21: 3-mode kick (invalid output) — bug
- G22: 3-mode kick fix bug (+0.53% 拒) — 混 3 变量, 不可读
- G23: 最终 LS pass (-0.04% 棘轮外) — 无信号
- G24: ILS 内 LS 预算 10/3→15/4 (+0.36% 拒) — kick 后回同 basin, 浪费

**结论**: 起点 / LS 预算 (任一位置) / 最终 pass 全部饱和; kick 拓扑是唯一未隔离变量

## G25 动机
- packer #126.2 建议: 拆 G22 变量, 单测 4-edge A-D-C-B
- drifter #118 G17 引入 3-mode 池 (含 4-edge) 拿到明显更优, 提示 4-edge 是关键
- 单变量: ILS kick 50% 走 A-D-C-B (4-edge), 50% 走 A-C-D-B (3-edge 保留)
- 不动: start 集合, LS 预算, 接受准则, runLS
- 预期代价: 0 (代码同长度, 多 1 个 Math.random)

## G25 假设拆解
1. holdout ≤ 0.8140 → 接受, 验证 4-edge kick 是缺口
2. ∈ [0.8140, 0.8157] → 有改进但未越棘轮 → G26 = 100% 4-edge 最大化
3. ≈ 0.8157 → 50/50 混合无效, 3-edge 主导 → G26 = 100% 4-edge 隔离测
4. > 0.8157 → 4-edge 反而伤害, kick 拓扑不是缺口 → 换方向 (LK-style kick, 接受准则松弛)

## 待执行
- G26: 取决于 G25 反馈
  - #1/#2 → 100% 4-edge 或 75% 4-edge 比例扫描
  - #3 → 100% 4-edge 隔离
  - #4 → 换方向: LK-style kick / SA 接受 / NN+2opt 起点

## 永久不做 (永久)
- LK 双桥 (G16 -0.60%) / 随机起点 (G17 +0.77%) / or-opt L=[1..5] 全开 (G18 -0.06%) / 起点城轴 / cheapest-insertion 起点 (G20 0.00%)

## 永久不做 (待重测, pending)
- reverse-insertion: G19 +0.69%
- 多 mode kick 池: G22 +0.53% (G25 单 mode 测试中)
- 最终 LS 强化: G23 -0.04%
- ILS 内 LS 预算: G24 +0.36%