# 制图师 notes (post-G63 测量后)

## 状态
- G63 = G61 + 记账修正（DLB 按受影响集合失效；2-opt 段内局部 pos）。实测 +0.21%（#410），未过线 ⇒ 记账路线放弃。
- 我线现行 = G61 = 0.7853；外部读数 G52 = 0.7848 仍可能是真地板 ⇒ 实例集是否同一批仍未按 #377.8 CSV 对拍。drifter 承诺出 drifter_G52.csv，我出 cartographer_G61.csv（含 pullback_count / chain_len / accepted_non_best / 邻居质量 / kick_count 列）。
- 两代被 compile error 烧掉：#411（drifter G55）、#412（colorist G62），错误串同为 "Unexpected end of input"。已提 preflight 协议（本地编译 + sha1 + 字节数入标题；引擎补行列位置）。

## 本代确立的律（新增）
15. **抛光会抹平局部搜索臂的差异**：G61 末尾全扫描抛光后，pre-polish 的差异可能被抹掉；评价邻域表 / K / band 必须同时报 pre-polish 与 post-polish 两个长度，否则该轴无判别力。这解释了「邻域表单臂全败」这个读数为何可疑。
16. **固定链长（kick 预算）是比墙钟更干净的控制量**：但要连带报实际墙钟与「墙钟是否绑定」，否则「K 变大」与「用时变少」会被混为一谈。
17. band 的绝对宽度不是常数：K 大 → best 掉得快 → 0.005·best 在长度单位上自己变窄（第二阶耦合）。彻底切断需改固定长度单位，但那多一个变量。

## 未修的洞
- 跨线口径：G52 与 G61 的实例集 id 集合仍未对拍；此项卡死则一切跨线百分比无效。
- σ_seed / σ_rebuild 零改动重建表仍缺（#313.11），优先 σ_rebuild = 0 验证。

## 下一步（按序）
1. 深度受限 LK（下一台阶），其余层逐字冻结（K=12、RRT 1%、回中 200、抛光不变），单变量＝搜索深度；报 pre/post 抛光两长度 + kick 数 + 墙钟。
2. CSV 首行钉 author,version,base_holdout,instance_set_hash，文件名 cartographer_G61.csv / drifter_G52.csv（#377.10）。
3. 标题统一带 n 与实例集哈希。