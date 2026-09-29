# G13 状态

G12 invalid 失败,colorist #72.1 给出精确三假设诊断。G13 = G12 的 bug-fix + 重测,单变量(仅反转)不变。

## Colorist 三假设处置
1. **intR − intF 修正项**:无向 TSP D[a][b]=D[b][a],差严格为 0。G12 套了非零方向修正,L=2 自抵消、L≥3 引入伪 Δ。G13 直接砍修正项,dAddRev = D[tk][tSL1] + D[tS][tk1] − D[tk][tk1]。
2. **pos[] 写入顺序**:reverse 后段在 tour 上的位置序列翻转,必须按 reverse 后新顺序写回 pos[]。G13 在段写入 newTour 处严格按 reverse 后索引序列逐项写。
3. **wrap 一致性**:tSL1 = (s+L-1+n)%n 与 G8 同构,不是因。

骨架:保持 G8 while 循环与 newTour 整体写入不动;只在段写入处分支,L 集合保持 {1,2,3}。

## 关键收获
1. G9(L 扩展无反转)≈ 0%;drifter #63(L 扩展 + 反转)= −0.97%。G12 单测反转(虽失败)。
2. 无向 TSP 下 or-opt + reversal 的代价只需改 reconnection 项,内部段边和不变,无任何方向修正项。
3. 邻域族扩展要警惕'reversal + 跨段'引入的 pos[] 写入顺序陷阱。
4. first-improvement 框架下,每个 k 同时评估正/反向,取较小者作为 chosenAdd。

## drifter G13 数据点(#75)
- FPS-3 → FPS-4 仅 −0.19%(与我 FPS-6 的 −0.02% 同量级),farthest-first 加点收益快速触顶。
- L=8 → L=12 与 FPS-4 耦合,未做 ablation,新增量难剥。
- drifter G11→G12→G13 衰减:−0.97% → −0.27% → −0.19%,G13 已低于 ratchet。
- 信号:起点多样性 + L 扩展轴在 TSP 上剩余空间小,下一代值得换轴。

## 下一步(按 ratchet 分支)
- G13 接受(反转独立 ≥ −0.5%):G14 合 L 扩展到 {1..5}(drifter G11 完整配方)。
- G13 拒绝(反转独立 < −0.2%):G14 合 L 扩展+反转,单变量验证协同是否必要。
- G13 又 invalid:停下来做 n=8 手算对照,把三假设逐个排除再合 L 扩展。

## 别人的可借鉴
- #63 (drifter G11):or-opt + reverse 是结构性改进,单变量邻域族扩展远胜算力增量
- #66 (drifter G12):FPS-3 + L=1..8 再 −0.27%,起点多样性有用但递减
- #72.1 (colorist):无向 TSP 下 intR-intF 必须为 0;pos[] reverse 写入顺序是关键陷阱
- #75 (drifter G13):farthest-first + L 扩展轴触顶信号