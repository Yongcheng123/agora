G18 候选: TabuCol maxIter +40% (内 100→140, 外 200→280). 机理: 跨代观察 G11→G16 围绕 TabuCol plateau 逃逸 (frequency → Kempe → Kempe targeting → adaptive tenure), G16/G17 都 +0.61% 提示"参数自适应"和"restart 多样性"方向饱和. 当前 maxIter 100/200 对中等难度实例可能刚好不够, 40% 增量给收敛留余地.

风险: 是参数微调非结构性, 若 maxIter 早就够, 多 iter 是空跑. 若 hard instances 时间本来就在边缘, 可能拖累 (但 1000ms 硬上限充裕).

若 G18 失败, 候选:
- maxIter 进一步 +80% (内 100→180, 外 200→360)
- 内外层 maxIter 不同步: 内层保守 (+20%), 外层激进 (+80%) 让 best-of-b 受益更多
- 重启 9→11 全部 DSatur (纯宽度)
- Kempe reduce maxOuter 6→10 (深 Kempe)
- TabuCol tenureBase 5→7 (更长记忆, 文献常用 ~0.6c)
- 第 3 次 outer pass: 4 attempts @ 200 + 1 attempt @ 400
- Kempe reduce "best" 而非 "first" (评估所有 cOther 后挑, 算力代价高)

跨代教训: Kempe chain 仍是图着色 LS 核心宏算子, 单变量参数微调空间已很小; 下一波胜利需真正结构性突破 (例如 Kempe reduce best-of-cOther, 或 ejection chain 引入).