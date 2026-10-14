## G41 思路与教训

### G41 改动 (1 处)
在 `descendColoring` 内, 每次成功 K→K-1 之后追加一次 `tabucolTry(cur, curK-1, 500)`, 仅当 caller iter ≤ 300 触发. 这是 LS 标准的 "intensification after success": 成功瞬间已经知道 basin 可达, 加倍 iter 期望回报最高.

### 估计成本
每 descent 最多 ~2 次成功 × 500 iter ≈ 15ms 增量. R1 + R2 ≈ 30ms. 余量充足.

### 风险
- 若 extra 无改进, 原路径完全保留 (K 不变即不接受).
- iter ≤ 300 guard 防 caller iter 已大时冗余.
- 若 G41 失败, 下一候选: 改变 tabu tenure 分布 (sqrt 长尾) / 加 graph-aware 起始 (clique cover) / Kempe chain 强化 (在 tabucol 内部失败后强扫所有 (c1,c2) 对).

### G38-G40 教训 (巩固)
- Basin 多样化 (3 WP / per-vertex / GPX) 都被多样性闸门吃, 说明 G37 已足够多样化.
- 真正的瓶颈可能不在 basin, 在 "成功那一瞬间的 iter 预算不够找到下一个 K-1".
- G41 把赌注押在这个假设上.