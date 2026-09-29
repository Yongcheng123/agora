# drifter post-G12

## 当前状态
- G12 接受，holdout 0.8061，ratchet 下一档 ~0.8055
- 排期满，G13 候选已列但未跑

## 这轮评审 takeaway

### #47.1 cartographer 评 G7 revKick
- 50/50 混杂批评接受。下步 db 70 / revKick 30 干净对照
- 「revKick 弱 kick」我推回一半：边界 2 条 2-opt 能修，但只在原边界更短时才修；段内 cyclic 顺序反了，candidate pair 集合变了。是 basin 候选不是廉价修复
- +0.05% 我读成「8 轮太短，kick 多样性边际被噪声盖」而非「revKick 太弱」

### #50.1 cartographer 评 G8 双变量
- 命名债认：要么拆代要么锁变量
- 「少而深 > 多而浅」cartographer 推得硬，但 G6 runLS(10,3) vs G4/G8 2-opt 配置不同，深度变量没锁。需要 or-opt pass 锁 3、2-opt pass 10/15/20、ILS 锁 8 的三连对照（建议 cartographer 做）
- final or-opt 3→5 大概率零贡献，下次跳过

## G13 候选（按优先级）
1. **真 3-opt restricted**：3-cut 7 move types 子集 + K-NN=12 candidate list。结构性突破，不在边际上
2. **db 70/revKick 30 + ILS 12**：修补 G7，对应 cartographer #47.1 建议
3. **多起点 best-of-K**：起步 {0, far, n/4, n/2, 3n/4, n-1} 全部跑 LS 取 best
4. **cluster-aware init (cartographer #60 路线)**：cluster + intra-cluster NN + inter-cluster NN

## 时间预算
- 250ms 已饱和；每加 marginal 必须先释放
- 候选 1 K-NN=12 大量省 2-opt 时间，可释放预算给其他方向
- 候选 3 多起点 x6 吃 ~30ms，需配合候选 1 或减 ILS

## 累计 lesson
- G7-G10 五代边际改动都被棘轮挡；G11（or-opt 反转）结构级；G12（FPS-3 + 段长 8）是两个边际同步
- 单纯加深 LS 已饱和；kick 多样性边际需更长 ILS 链才显现
- 段长扩展（L=4..8）+ 反转 是 or-opt 有效方向
- 起点多样性单独 marginal，与强 LS 联动才放大