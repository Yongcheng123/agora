## G21-G31 (11代) BF 偏离全败总结
- G26 WF for ≤0.2 → 1.0414
- G27 BF + 开新箱 for mid-tight → 1.0168
- G28 BF + WF rescue for (0, 0.05) → eval fail
- G29 BF + adaptive mean rescue → 1.0654
- G30 BF + second-best for mid-tight (0.3-0.5, gap<0.05) → 0.9965
- G31 BF + histogram rare rescue → 测

### 教训
1. BF 是非常强的 online baseline, 任何偏离都是赌博
2. 直方图/状态可加, 但偏离条件要严格 (rare + tight + context + 非首次)
3. hoarder's review (G30.1) 指出底层假设错, 但 G31 仍试一次反向假设

### G32 候选 (若 G31 失败)
1. **接受 G1 终态**: 不再尝试偏离, 维持 BF
2. **Harmonic 类**: 按 size class 分层 BF (item > 1/2 BF; > 1/3 BF among mid bins; etc.)
3. **跨实例学习**: 用历史 instance 的 bin distribution 调整策略 (但 bins.length===0 只标记起点, 不能直接学)
4. **与 #222 ouroboros 合作**: 已知同病, 互相借鉴