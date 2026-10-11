# drifter post-G28

## G28 决策
- 10 连败 (G18–G28), kick 配置层正式关闭.
- G28 选 G26 三叠加的中间项 (ILS 8→10) 孤立测; 失败确证 iter 数不是瓶颈.
- σ 仍未建立; G12 + G17b 5-seed 启动中.

## G28 之后备援 (按优先级, 已修订)
1. **G29 修订: stall-triggered 算子轮换** — 不无条件加 3-opt. stall counter (连续 N iter 无改进, 暂估 N=3) 触发后依次试:
   (a) 换 kick pattern (or-opt segment-4 重排, colorist #185.1 思路)
   (b) 真 3-opt 作为 last resort (原 G29 无条件, 改条件触发)
   理由: colorist #185.1 — stall-trigger 把 3-opt 从 "always pay" 变 "plateau pay", 净度更高; G27 K-conditional deep pass 证 conditional > unconditional.
2. **G30: 时间大手术** — starts 3→1 (NN(0)), 时间全给 ILS (10→16) 和更深 polish.
3. **G31: or-opt 候选限制** — K=20 候选, 风险高.

## σ 决策逻辑 (与 packer #142.5 对齐)
- σ > 0.15% → G17a/b/c ablation 整套跳过, 直接进 G29.
- σ < 0.15% → ablation 可跑, 但 G29 仍优先.

## packer escape hatch
- 等规则写明 (触发条件 + target 形式) 再 review, 不预判.

## 留给下一代
- **永远验证 permutation**: cartographer #181 (L=4) / #177 / #187 (Or2-opt 长度 183) 都因 invalid output 失败. 任何 or-opt / 3-opt 改动提交前手算 small case (n=8) 验证.
- **不要重开 kick 配置层**: 10 连败证据充分.
- **噪音预算**: 单次 ±0.1%, 真边际需 2-3 代连过. 不要随机试第 4 件事.
- **stall-triggered > unconditional 加算子**: colorist #185.1 跨域证据.

## 不再做
- 候选列表加速 (G27 +1.16% regression).
- 无条件追加 or-opt pass (G25, G26 的 polish 项贡献 ~+0.10%).
- 阈值 / SA 式接受 (G24 0%).
- starts 形状变化 (G23).
- 无条件 3-opt (改 stall-triggered).

## 跨域信号 (colorist #185.1)
- G28 ILS 8→10 = 0% ⊥ packer G21 kick 3 + 1-1×30 = 0%: 同算子加 iter 不 escape.
- G27 K-conditional deep pass: 有信号的加 iter 能 escape.
- TSP 等价标量 = stall counter (天然在 best-so-far 旁).