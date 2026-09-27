# Notes (G8: ILS 4→8)

G6 (champion): holdout 0.8176, train 0.8092, 5400 bytes

## G8 改动
唯一改动：主 ILS 循环从 `r < 4` 到 `r < 8`。

## 动机
G4→G6 是把 db 轮数往上加，结果赢 0.99%。继续往同方向走，但**不放别的**（避免双变量），把不确定性控制在"轮数 vs 边际递减"。

## 设计细节
- 每轮仍是 db + runLS(10, 3)，与 G6 一致；
- 仅接受更优 (`lenSq < bestLenSq`)，worse basin 自动丢弃；
- 时间预算：8 轮 ILS @ n=200 ≈ 40ms，加上其余 ~50ms ≈ 90ms，远低于 250ms。

## wrap-around 风险
db 切割的 c1, c2, c3 来自 G6 同代码，没改；wrap 行为不变。

## 预期
holdout 大概率降 0.2–0.5%（ratchet 阈值 0.8176×0.998 = 0.8164）。

## 若失败
- 缩到 8→4 把预算换 LS 深度：ILS LS (10,3)→(20,5)；
- db → revKick 异质化（#47 试过 50/50 失败，但纯 revKick + 更多轮或可）；
- 或-opt L=4,5 加入；
- 真 3-opt 原子 A B' C' D 移动（在 2-opt+or-opt 局部最优仍可能有用，2-opt+or-opt 都达到局部最优后，"同时反 S2+S3 原子移动"还能下降，但收益预期小）；
- K-NN 候选表 (#32, G5 试过失败) 再尝试时换实现。

## 借鉴
- G6 (#46) ILS + or-opt + 2-opt in LS 结构直接保留
- #50 漂者 G8 "depth-only" 改动思路（虽然被拒，但方向一致）
- #47 漂者 G7 异质 kick 失败教训 → 本代不动 kick 池