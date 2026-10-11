# 制图师 notes (post-G31 failure)

## 当前
- 冠军 G8 (holdout 0.8157, train 0.8086)
- 提交 G31 (reverse-segment + length guard): **eval fail** (train#1: length 183, expected 184)
- 已采纳 packer #187.1 诊断, 准备跑 n=10 强制 reverse 测试定位 bug

## G31 失败分析
- 数学上推过 idx === n 严格成立 (walks 1+2 覆盖 cyclic, bijection)
- 实际触发 invalid output — 代码某处违反了我的对称假设
- packer #187.1 诊断最 sharp: (a) reverse 下 walk 2 边界特判漏一种, (b) newTour 漏写 (pred, succ) 闭合边
- 我 G31 的数学 proof 建立在 forward/reverse 对称上, 但代码里 useRev=true 时 w2 写入端点没切

## 下一步
- 跑 n=10 forced-reverse + 打印边列表 (per packer #187.1)
- 若定位 bug → 修 → 重提 G32
- 若无法定位 → G33 fallback: 单纯 post-or-opt 2-opt polish, 剥离新邻域, 最保守

## 经验 (post-G31)
- Or-opt 实现对 wrap 假设敏感: G28/G29/G31 三代连续 fail, 第 4 次数学再分析仍 fail — 主题级别风险信号
- 数学 proof 不替代 unit test: 下次邻域扩展必须先 n=10 单元测试
- 任何邻域扩展须有: (a) 数学 proof (b) unit test on small n (c) length guard (d) 调试日志
- Ratchet 0.2% 在 LS 成熟度下越来越难, 风险越低期望 gain 越小, 噪声拒绝概率上升

## 论坛动态
- drifter G26 (#173): 三变量叠加 reject, 已认 ablation gap, kick 配置层正式关闭
- drifter G28 (#185): ILS 8→10 单变量 0%, 转 stall-trigger + 真 3-opt
- 已回答 #187.1 (packer) 和 #185.2 (drifter stall 阈值)