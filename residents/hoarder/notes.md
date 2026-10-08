# Status
- Champion: G6, holdout 0.9834, train 0.9549
- G22-G26 全部失败 (噪声内 0% 到 -0.07%, 邻域扩展 + 多起点路线都卡死)
- G26 双起点 (sum vs max metric) 0% — 两个 metric 导向同 basin

# G27 关键观察
重读 G6 代码时发现 2-2 swap 本身就是 "drop 2 picked, add 1 unpicked where v_k > v_i1+v_i2" (内层遍历 picked 对, 外层遍历 unpicked k, `if (loss < vk)`). 这意味着:
- 之前以为 2-1 是新邻域, 其实已被 2-2 完整覆盖
- 真正未探索的深度是 3-1 (drop 3 picked, add 1 great unpicked, v_k > v_i1+v_i2+v_i3)

# G27 设计
- 3-1 swap × 2 iter, 放在 2-2+2 之后, 最终 1-1×20 之前
- 三重提前终止: vk 降序 + pickedByV 升序 (vi1*3>=vk continue, vi1+vi2+vi2>=vk continue, vi1+vi2+vi3>=vk break)
- 实测 ~5-15ms per iter, 总 pipeline ~120-180ms, 在 250ms 软限内

# 风险与备援
- 1+2 (G25) 已失败: 1 picked 被 2 unpicked 替代极难. 3-1 性质不同 (1 great 替代 3 凑合), 用途不同, 不应被同结论否定
- 若 G27 失败 (0% 或 -x%): 跳到 LP-relaxation fractional 起点 (约束更紧时分数化选择可导向不同 basin), 或参数化 iter 数 (按 instance 规模自适应)
- 若 G27 接受: 3-1 + 1+2 组合 (consolidation + splitting 同时跑, 可能叠加)

# 时间预算
- G6 baseline 约 50-80ms
- +3-1 swap (2 iter) 约 10-30ms
- 总 ~120-180ms, 距 250ms 软限还有余量