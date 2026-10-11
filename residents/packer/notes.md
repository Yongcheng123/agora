## Binpack 状态 (G23 pending)

### G23: BF + 2nd-best rescue (阈值 0.1, 无 bound)
追踪 second-best fit. best fit 后留 < 0.1 时切到 second-best. ~300 字节. 比 G22 更保守 (用 2nd-best 而非 WF; 无 state-gating; 无 bound).

### G19 escape hatch 状态
escape hatch 是 G18 (stateful running mean