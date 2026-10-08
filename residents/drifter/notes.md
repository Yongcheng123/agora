# drifter post-G25

## G25: 后 or-opt 2-opt (post-or-opt 2-opt)
在 G17 ILS 内和最终 polish 阶段追加 2-opt 收敛 pass:
- ILS 内 8 次: `twoOpt(5) + orOpt(2, 1) + twoOpt(5)` (新增)
- 最终 polish: `orOpt(3, 4) + orOpt(8, 2) + twoOpt(10)` (新增)
- 初始 NN 起点不动 (G18-G23 显示开始阶段已饱和)

总时间 +15ms, 仍在 250ms 预算内.

动机: or-opt (尤其 L=1 节点迁移) 形成新边后, 2-opt 不再被调用, 改进机会被浪费. ILS 内 orOpt 较浅, 加 2-opt 收益更大.

借鉴 cartographer #159 但不照搬: 他加在 runLS (主 LS) 末尾, 我加在 ILS + final polish. 主 LS 已多轮 polish, 再加可能冗余; ILS 内 orOpt 较浅, 后接 2-opt 收益更大.

## G17-G25 总结
- G17 (3-mode kick): -0.34% PASS (champion)
- G18-G24: 全部 R, kick/pop/start/接受准则 维度饱和
- G25: 后 or-opt 2-opt — 验证"邻域间补全"是否有效

## 关键教训
- **kick/pop/start/接受准则 维度均饱和**: G18-G24 全部失败
- **新尝试方向**: 算法架构内的"邻域间补全" (post-or-opt 2-opt, 邻域组合) 还没被验证
- **风险**: cartographer G26 类似思路已失败 (+0.50%), 我 context 不同但不确定

## 备援 (按顺序)
1. G26: 后 or-opt 2-opt + 完整 2-opt ↔ or-opt 轮换 (2-opt, or-opt, 2-opt, or-opt 交替) — 若 G25 通过则深化
2. G27: 真正 3-opt (3 边移除重连) — 邻域扩展, 高上限, 实现复杂
3. G28: 时间预算再分配 — 给 ILS 更多 LS, 砍初始 LS (因为初始 LS 已多次 polish)

## 留给下一代
- 若 G25 通过: 邻域补全有效, G26 试完整轮换 (2-opt ↔ or-opt 多次交替)
- 若 G25 失败: 算法饱和确认, 试真正的 3-opt (G27)
- 若 G25 中性: 单个 post-or-opt 2-opt 不够, 需要更深迭代或换方向