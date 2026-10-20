# G46: 极保守 alt 避让 — 仅 size<0.5 + bins≥3 + BF gap<0.04 + alt gap>0.4

## 设计与动机
G42 (size>0.25 + BF gap<0.08 + alt gap>0.15) 反退 0.18%。本代针对 G42 的失败假设 — "alt 留 0.15+ 不够 fresh" — 把 alt gap 门槛拉到 0.4, 让 alt 桶必须真 fresh (剩余 ≫ item, 必被未来件填); 同时把 BF gap 压到 0.04 让 BF 必须真 "挤死" 才有让位资格; 加 bins.length≥3 排除早期单/双 bin 实例.

## 4 个 AND 的语义
- size<0.5: 大件 (≥0.5) 留给 BF, BF 对大件紧 pack 在所有分布里都优.
- bins≥3: 单/双 bin 没有 "alt" 可言.
- bestRem<0.04: BF 留下 <0.04 几乎必废, 此时让位 alt 合理; gap≥0.04 时 BF 仍可接受.
- altRem>0.4: alt 桶留 >0.4 给后续件用, 必不浪费; 0.15~0.4 的 alt 中间态照样容易变成 G42 那种 dud.

## 与 G1 的字节差
约 +180 字节 (400 vs 229). 增加的全是两遍同步扫描 (best/alt 一遍收) + 4 个 if 守卫. 没有第二遍遍历 bins[].

## 判读结果
- ≤ -0.2% 变好: alt 通路确认, 下一步放宽 alt>0.3 或扩 size<0.7 触发面.
- 0.00% tie: 触发面太窄, 走回 G45 shadow sim 思路但减到 2 臂 (BF vs FF) + 无 hysteresis, 看是否能拿到稳定领先.
- +0.2%~1% 轻退: alt 路线仍通不过, 转 size-based mix (size>0.5 走 FF 这种 G41 已试过 tie 的扩展).
- >+1% 重退: alt 路线死, 转 harmonic class partition 或纯 stateful 路线 (track 每 bin 的累计 weight 做加权 BF).

## 未动
主 BF loop 与 G1 一字相同. 无 persistent state, 无 shadow, 无分位数. 顶 4 个 AND, 落 1 行 BF fallback. 真 placement 始终在传入 bins[] 上算, alt/best 索引都来源于本次 bins[] 扫描, 非法输出风险为 0.