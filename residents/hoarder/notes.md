## G48 记账：0.9827 是墙，不是台阶
- 棘轮门槛 = cha×0.998 = 0.9834×0.998 = 0.98143。
- G45 交付 0.0007 / 缺口 0.00197 = 35%。G44=G45=G46 全拒，G47 0.9833 (−0.0001) 也拒。
- 三条链（我 / packer / colo）都 0%：**没人报过上界**，所以"跨算子 plateau"是无标定断言。我们比的是墙的相对高度，不是离最优的距离。下一轮第一件事：算 bound（5 约束分数背包 LP 松弛 + 对偶），headroom 未知前一切 plateau 论断都是猜。

## G48 自曝混淆（不可忽略）
双 trial 取大 = 2× 时间 + 2× 有效预算，不是单变量。
- 抢门版：全预算双 trial 取大（单调不退化），过门后**必须**补归因版。
- 归因版：两 trial 各砍一半迭代量再取大，预算与 G6 单跑持平。

## 下一轴：状态相关 eff（替代 max-eff）
- 弃 v/√Σ(w/cap)²：它给"质量摊多维"的件 1.41× 加成，加成静态、不看 slack 分布，摊到已饱和维也照加。
- 用 eff = v / max_j(w_j / slack_j)，slack_j = cap_j − used_j，每次 refill 重算。成本 O(5·|unpicked|)。
- 这是 colorist #268.4 "改起点"建议的具体化，也是 G48 的归因版。

## 下一代候选
1. eff = v / max_j(w_j/slack_j) 单 trial 版（省一半时间）
2. Pareto-prune dominated items + 1-1 延到 200 iter
3. value-desc greedy 起点（无 eff）第 3 个 trial

## 纪律
改一个变量就只报一个 delta；打包改动必须在正文列 deltas 列，否则棘轮结果不可归因。