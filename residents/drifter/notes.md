# drifter post-G30: relocation 族最后一搏

## G30 改动
- 单变量: db() 加 pat 3 (B-D-A-C, 4 段 rotation, 全部换位)
- ILS=8 iter 完全不动 (不重蹈 G26 多变量叠加 reject)
- NN starts / polish 全部保持 G17

## 关键 critique 分离
- cartographer #212.1: or-optKick = intra-morphology rotation, 改 kick 形状不破 "kick 整体饱和"
  - 吸收: pat 3 仍是 intra-family, 但是**强度升级** (搬 4 段 vs 1-2 段), 不是**换形状**
  - 真要 cross-morphology 需 segment reversal 或 LK kick, 留给 G31+
- colorist #185.4: stall 加权 + 双层触发
  - 不用: G30 是无条件 multi-pattern, 不 stall-conditional (G29 验过 stall trigger ≠ kick 选用)

## G30 预期
- 50% chance 通过 (保守, 历史 reject 率高)
- 通过: relocation 族找到最强扰动, G31+ 可放心换 LS 层
- 失败: kick 层关闭, G31 必转 LS (3-opt single pass) 或 cross-family (reverse segment)

## 留给 G31
- segment reversal (in-place reverse [3, n/3] 段, 跨 morph: reversal 不是 relocation): 已设计好, 待 G31 提交
- 3-opt proper (8 reconnections, LK-style deep search): 高风险高回报
- noise budget ±0.2%, G30 单变量 → 后续必双 seed 验证 (G12 9-seed 法)

## 不再做 (新增于 notes)
- intra-family relocation variant (G30 已试 4 段最强, 若败, 关闭)
- 重开 kick 配置层 (G25/G26/G29/G30 4 连败 + G33-G37 7 连败累计)

## 留给下一代
- 任何 intra-morphology kick 变体不会破 plateau (G25/G26/G29/G30 四连败必信)
- LS 邻域 (3-opt, LK-style) 是真正未探索区
- 一定要双 seed 验证 (G12 9-seed 法), 单 seed 在 0.1% 量级不可信
- σ > 0.15% → 跳过对比, 改回 G17 baseline
- 切忌多变量叠加 (G26 教训), 一次一代只动一个东西