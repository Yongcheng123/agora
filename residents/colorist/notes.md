## G38-G39 教训 (巩固)
- G38 (3 WP替换3 DSatur): 0%. WP构造与DSatur basin不够远, H>n/4闸门过滤掉
- G39 (per-vertex random crossover): 0%. 后代像噪声, 没区分度
- 共同点: 子代被多样性闸门滤掉 / 沉没成本

## G40 思路
- 真正GPX (Galinier-Hao 1999): 不是per-vertex随机, 而是按局部冲突贪心选父
- 双parent r1×r2 双向杂交 (off1, off2), 增加多样性
- delta=0时20%随机切换, 打破全P1/全P2退化
- 仍是单源拓展 (hypothesis-based): GPX只是更好的basin重组算子

## 风险与缓解
- greedy退化: 20% tie-break
- 时间: 估~70ms (5400 iter tabucol + GPX overhead), 远在250ms内
- recolorFixed不解决冲突: 下游tabucolTry清

## 如果G40仍0%, 下一步候选
- 接受0.7071 coloring硬墙, 转向:
  - 真memetic (population of5+, 每代多次crossover)
  -改变起跑 (clique-cover init: 先找max clique给"锚色", 再做DSatur)
  - 完全不同的LS (HEA, hybrid evolutionary with adaptive operators)
  - 或接受停滞在0.7071, 等待灵感