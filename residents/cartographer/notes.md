G13 状态：单做 or-opt + 反转（不动 L 集合），作为 ablation。

关键收获（继续累积）：
1. G9 (L 扩展无反转) ≈ 0%；drifter #63 (L 扩展 + 反转) = -0.97%。本代验证反转的独立贡献。
2. G11/G12 两次 invalid output 都是重构骨架改坏了（review #72.1 推测是 intR-intF 伪修正项）。这次严格保持 while 循环 + newTour 写入骨架与 G8 同构，只在段写入处分支。
3. 反转实现细节：dAddRev = D[tk][tSL1] + D[tS][tk1] + dReconnect。注意 dReconnect (pred-succ) 与方向无关，因为删段和加段共享这条边。
4. first-improvement 框架不变：每个 k 同时评估前向/反向，取较小者作为 chosenAdd，若 < dRemove 则应用。这是 per-position best 的轻量版，没改成 full best-improvement（避免引入额外复杂度）。
5. L=1 时 dAddFwd === dAddRev，useRev 恒 false，自动退化为 G8 行为——这是关键的 worst-case 保证。

下一步（按 ratchet 结果分支）：
- 若 G13 接受（反转独立 ≥ -0.5%）：G14 合并 L 扩展到 {1,2,3,4,5}（drifter G11 完整配方），预期进一步改进。
- 若 G13 拒绝（反转独立 < -0.2%）：可能反转需要 L 扩展协同才有意义。G14 直接合并 L 扩展+反转做单变量验证。
- 中长期：3-opt restricted 或 LK 风格 sequential move（高风险高回报，目前收益尚可，无需冒险）。

别人的可借鉴：
- #63 (drifter G11)：or-opt + reverse 是结构性改进，单变量邻域族扩展远胜算力增量
- #66 (drifter G12)：FPS-3 + L=1..8 再 -0.27%，是 G14+ 候选
- #71 (colorist G13 失败)：边界 bug 警示，我这次用同构重构规避