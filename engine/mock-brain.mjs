// Deterministic fake brain: proves the whole loop without an LLM.
//   node engine/mock-brain.mjs --tasks .agora/tasks.json --out .agora/responses.json
// Library use: `mockRespond(plan)` → array of responses (DESIGN §6).
// Evolve: walks a small per-task library of known-better (and some known-worse) solvers, sometimes
// emits broken code or a no-op tweak, and cites other residents' posts. Reply: Chinese comments that
// reference real post / comment ids from the task context. Digest: summarises the engine's stats.
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { hash32 } from './store.mjs';

// ---------------- solver library ----------------
const TSP_HELPERS = `
function nnTour(points, D, n) {
  const used = new Uint8Array(n), tour = [0]; used[0] = 1; let cur = 0;
  for (let k = 1; k < n; k++) {
    let best = -1, bd = Infinity;
    for (let j = 0; j < n; j++) if (!used[j] && D[cur * n + j] < bd) { bd = D[cur * n + j]; best = j; }
    used[best] = 1; tour.push(best); cur = best;
  }
  return tour;
}
function distMatrix(points) {
  const n = points.length, D = new Float64Array(n * n);
  for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) D[i * n + j] = Math.hypot(points[i][0] - points[j][0], points[i][1] - points[j][1]);
  return D;
}
function twoOpt(tour, D, n, maxPasses) {
  let improved = true, passes = 0;
  while (improved && passes++ < maxPasses) {
    improved = false;
    for (let i = 0; i < n - 1; i++) for (let j = i + 2; j < n; j++) {
      if (i === 0 && j === n - 1) continue;
      const a = tour[i], b = tour[i + 1], c = tour[j], e = tour[(j + 1) % n];
      if (D[a * n + c] + D[b * n + e] < D[a * n + b] + D[c * n + e] - 1e-9) {
        for (let l = i + 1, r = j; l < r; l++, r--) { const t = tour[l]; tour[l] = tour[r]; tour[r] = t; }
        improved = true;
      }
    }
  }
  return tour;
}`;

const TSP_OROPT = `
function orOpt(tour, D, n) {
  let improved = false;
  for (let L = 1; L <= 3; L++) for (let i = 0; i + L <= n; i++) {
    const prev = tour[(i - 1 + n) % n], next = tour[(i + L) % n], s0 = tour[i], s1 = tour[i + L - 1];
    const gainOut = D[prev * n + s0] + D[s1 * n + next] - D[prev * n + next];
    const rest = tour.slice(0, i).concat(tour.slice(i + L)), m = rest.length;
    let best = 1e-9, bj = -1, rev = false;
    for (let j = 0; j < m; j++) {
      const a = rest[j], b = rest[(j + 1) % m];
      if (a === prev && b === next) continue;
      const add1 = D[a * n + s0] + D[s1 * n + b] - D[a * n + b], add2 = D[a * n + s1] + D[s0 * n + b] - D[a * n + b];
      if (gainOut - add1 > best) { best = gainOut - add1; bj = j; rev = false; }
      if (gainOut - add2 > best) { best = gainOut - add2; bj = j; rev = true; }
    }
    if (bj >= 0) { const seg = tour.slice(i, i + L); if (rev) seg.reverse(); rest.splice(bj + 1, 0, ...seg); tour = rest; improved = true; }
  }
  return { tour, improved };
}`;

export const LIB = {
  binpack: [
    { idea: '把 First Fit 换成 Best Fit：放进剩余空间最小且放得下的箱子', title: 'Best Fit：少留碎片',
      why: 'First Fit 只看顺序，常把小物品塞进还很空的旧箱子，浪费了能装大件的空间。Best Fit 让每个箱子尽量被“填满”，剩下的碎片更少。风险：对“先小后大”的序列可能没有优势。',
      code: `function place(size, bins) {
  let best = -1, left = Infinity;
  for (let i = 0; i < bins.length; i++) {
    const r = bins[i] - size;
    if (r >= -1e-9 && r < left) { left = r; best = i; }
  }
  return best;
}
` },
    { idea: '试试 Worst Fit：总是放进最空的箱子，给后来的大件留出整块空间', title: 'Worst Fit 反着来',
      why: '反直觉的实验：如果后面大件多，保持每个箱子都“半空”也许能减少新开箱。我不太相信它，但值得测一次，好知道 Best Fit 的提升来自哪里。',
      code: `function place(size, bins) {
  let best = -1, left = -Infinity;
  for (let i = 0; i < bins.length; i++) {
    const r = bins[i] - size;
    if (r >= -1e-9 && r > left) { left = r; best = i; }
  }
  return best;
}
` },
    { idea: 'Best Fit + 大件优先开新箱：>0.5 的物品若只能放进很空的箱子就另开', title: 'Best Fit 加一条大件规则',
      why: '大于 0.5 的物品两两不能同箱。把它放进一个很空的旧箱子，会占掉本可以装两件中等物品的位置。加一条简单规则：大件只进剩余 < 0.6 的箱子，否则新开。风险：规则阈值是拍脑袋的。',
      code: `function place(size, bins) {
  let best = -1, left = Infinity;
  for (let i = 0; i < bins.length; i++) {
    const r = bins[i] - size;
    if (r >= -1e-9 && r < left) { left = r; best = i; }
  }
  if (size > 0.5 && best >= 0 && bins[best] > 0.6 + size * 0.5) return -1;
  return best;
}
` },
  ],
  tsp: [
    { idea: '最近邻之后接 2-opt 边交换，直到没有改进', title: '最近邻 + 2-opt',
      why: '最近邻会留下大量交叉边，任何交叉都能被一次 2-opt 反转消除。先用距离矩阵，再做首次改进式 2-opt，限制最多 50 轮保证时间。风险：只到 2-opt 局部最优。',
      code: `function solve(points) {
  const n = points.length, D = distMatrix(points);
  return twoOpt(nnTour(points, D, n), D, n, 50);
}
${TSP_HELPERS}` },
    { idea: '在 2-opt 收敛后加 Or-opt 段移动（长度 1–3），两者交替到不动点', title: 'Or-opt 段移动接在 2-opt 后面',
      why: '2-opt 只会反转，搬不动“放错位置的一小段城市”。Or-opt 把 1–3 个连续城市挪到别处（可反向），正好补上这个盲区。交替执行直到两者都无改进，轮数有上限。',
      code: `function solve(points) {
  const n = points.length, D = distMatrix(points);
  let tour = twoOpt(nnTour(points, D, n), D, n, 50);
  for (let round = 0; round < 8; round++) {
    const r = orOpt(tour, D, n); tour = r.tour;
    if (!r.improved) break;
    tour = twoOpt(tour, D, n, 20);
  }
  return tour;
}
${TSP_HELPERS}
${TSP_OROPT}` },
  ],
  tsp_anneal: [
    { idea: '最近邻起步，用模拟退火做随机 2-opt 反转，最后再贪心 2-opt 收尾', title: '退火：先敢于变差',
      why: '确定性的 2-opt 会卡在第一个局部最优。退火允许以一定概率接受变差的反转，温度按几何级数下降，迭代次数固定（不看时钟）。最后用 2-opt 收尾，保证至少不差于局部最优。风险：参数没调，可能不稳定。',
      code: `function solve(points) {
  const n = points.length, D = distMatrix(points);
  let tour = nnTour(points, D, n);
  let T = 0, cnt = 0;
  for (let i = 0; i < n; i++) { T += D[tour[i] * n + tour[(i + 1) % n]]; cnt++; }
  T = (T / cnt) * 0.3;
  const iters = 60000, alpha = Math.pow(0.001, 1 / iters);
  for (let it = 0; it < iters; it++, T *= alpha) {
    let i = Math.floor(Math.random() * (n - 1)), j = Math.floor(Math.random() * (n - 1));
    if (i > j) { const t = i; i = j; j = t; }
    if (j - i < 2) continue;
    const a = tour[i], b = tour[i + 1], c = tour[j], e = tour[(j + 1) % n];
    const delta = D[a * n + c] + D[b * n + e] - D[a * n + b] - D[c * n + e];
    if (delta < 0 || Math.random() < Math.exp(-delta / T)) {
      for (let l = i + 1, r = j; l < r; l++, r--) { const t = tour[l]; tour[l] = tour[r]; tour[r] = t; }
    }
  }
  return twoOpt(tour, D, n, 50);
}
${TSP_HELPERS}` },
    { idea: '退火 + Or-opt 收尾：借用段移动来清理退火留下的错位小段', title: '退火之后再搬一搬',
      why: '退火结果里常有被“甩出去”的单个城市，2-opt 修不好。收尾阶段加上 Or-opt 段移动。',
      code: `function solve(points) {
  const n = points.length, D = distMatrix(points);
  let tour = nnTour(points, D, n);
  let T = 0;
  for (let i = 0; i < n; i++) T += D[tour[i] * n + tour[(i + 1) % n]];
  T = (T / n) * 0.3;
  const iters = 60000, alpha = Math.pow(0.001, 1 / iters);
  for (let it = 0; it < iters; it++, T *= alpha) {
    let i = Math.floor(Math.random() * (n - 1)), j = Math.floor(Math.random() * (n - 1));
    if (i > j) { const t = i; i = j; j = t; }
    if (j - i < 2) continue;
    const a = tour[i], b = tour[i + 1], c = tour[j], e = tour[(j + 1) % n];
    const delta = D[a * n + c] + D[b * n + e] - D[a * n + b] - D[c * n + e];
    if (delta < 0 || Math.random() < Math.exp(-delta / T)) {
      for (let l = i + 1, r = j; l < r; l++, r--) { const t = tour[l]; tour[l] = tour[r]; tour[r] = t; }
    }
  }
  tour = twoOpt(tour, D, n, 50);
  for (let round = 0; round < 8; round++) {
    const r = orOpt(tour, D, n); tour = r.tour;
    if (!r.improved) break;
    tour = twoOpt(tour, D, n, 20);
  }
  return tour;
}
${TSP_HELPERS}
${TSP_OROPT}` },
  ],
  coloring: [
    { idea: 'Welsh–Powell：按度数从大到小的顺序做贪心着色', title: 'Welsh–Powell 顺序',
      why: '按下标顺序着色忽略了结构。Welsh–Powell（1967）先给度数大的顶点上色，因为它们约束最多、越晚处理越容易被迫用新颜色。这是最简单的“有序贪心”。',
      code: `function solve(n, edges) {
  const adj = Array.from({ length: n }, () => []);
  for (const [u, v] of edges) { adj[u].push(v); adj[v].push(u); }
  const order = Array.from({ length: n }, (_, i) => i).sort((a, b) => adj[b].length - adj[a].length || a - b);
  const colors = new Array(n).fill(-1);
  for (const v of order) {
    const used = new Set();
    for (const u of adj[v]) if (colors[u] >= 0) used.add(colors[u]);
    let c = 0; while (used.has(c)) c++;
    colors[v] = c;
  }
  return colors;
}
` },
    { idea: 'DSatur（Brélaz 1979）：每步选饱和度最高的顶点，平局看度数', title: 'DSatur：动态地选最受约束的顶点',
      why: 'Welsh–Powell 的顺序是静态的。DSatur 在每一步重新计算“邻居里已经出现了几种颜色”（饱和度），总是先处理最被逼到角落的顶点。对二部图它是精确的，这说明它抓住了约束传播的本质。',
      code: `function solve(n, edges) {
  const adj = Array.from({ length: n }, () => []);
  for (const [u, v] of edges) { adj[u].push(v); adj[v].push(u); }
  const colors = new Array(n).fill(-1), sat = Array.from({ length: n }, () => new Set());
  for (let step = 0; step < n; step++) {
    let best = -1;
    for (let v = 0; v < n; v++) {
      if (colors[v] >= 0) continue;
      if (best < 0 || sat[v].size > sat[best].size || (sat[v].size === sat[best].size && adj[v].length > adj[best].length)) best = v;
    }
    let c = 0; while (sat[best].has(c)) c++;
    colors[best] = c;
    for (const u of adj[best]) sat[u].add(c);
  }
  return colors;
}
` },
    { idea: 'DSatur 之后做 Culberson 迭代贪心：按颜色类重排再贪心，颜色数单调不增', title: '迭代贪心：让颜色类互相挤一挤',
      why: 'Culberson（1992）证明：按现有颜色类为块重新排序后再做贪心，颜色数不会增加。反复打乱类的顺序（逆序、按大小），给贪心机会把小类合并掉。迭代次数固定。',
      code: `function solve(n, edges) {
  const adj = Array.from({ length: n }, () => []);
  for (const [u, v] of edges) { adj[u].push(v); adj[v].push(u); }
  let colors = new Array(n).fill(-1);
  const sat = Array.from({ length: n }, () => new Set());
  for (let step = 0; step < n; step++) {
    let best = -1;
    for (let v = 0; v < n; v++) {
      if (colors[v] >= 0) continue;
      if (best < 0 || sat[v].size > sat[best].size || (sat[v].size === sat[best].size && adj[v].length > adj[best].length)) best = v;
    }
    let c = 0; while (sat[best].has(c)) c++;
    colors[best] = c;
    for (const u of adj[best]) sat[u].add(c);
  }
  const greedy = (order) => {
    const col = new Array(n).fill(-1);
    for (const v of order) {
      const used = new Set();
      for (const u of adj[v]) if (col[u] >= 0) used.add(col[u]);
      let c = 0; while (used.has(c)) c++;
      col[v] = c;
    }
    return col;
  };
  for (let it = 0; it < 60; it++) {
    const k = Math.max(...colors) + 1, classes = Array.from({ length: k }, () => []);
    for (let v = 0; v < n; v++) classes[colors[v]].push(v);
    const mode = it % 3;
    if (mode === 0) classes.reverse();
    else if (mode === 1) classes.sort((a, b) => b.length - a.length);
    else for (let i = classes.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); const t = classes[i]; classes[i] = classes[j]; classes[j] = t; }
    const next = greedy(classes.flat());
    if (Math.max(...next) <= Math.max(...colors)) colors = next;
  }
  return colors;
}
` },
  ],
  knapsack: [
    { idea: '多种代理权重各跑一次贪心（Σw/cap、max w/cap、按剩余容量加权），取价值最高的', title: '多把尺子量一次',
      why: '单一的效率比只是一种代理约束。换几种权重各贪心一次再取最好，成本只是几倍的 O(n log n)，但不会比基线差（基线的排序就在其中）。',
      code: `function solve(items, caps) {
  const n = items.length, m = caps.length;
  const run = (weightOf) => {
    const eff = items.map((it, i) => [it.v / (weightOf(it) || 1e-9), i]);
    eff.sort((a, b) => b[0] - a[0] || a[1] - b[1]);
    const used = new Array(m).fill(0), picked = []; let val = 0;
    for (const [, i] of eff) {
      const w = items[i].w; let fits = true;
      for (let j = 0; j < m; j++) if (used[j] + w[j] > caps[j]) { fits = false; break; }
      if (!fits) continue;
      for (let j = 0; j < m; j++) used[j] += w[j];
      picked.push(i); val += items[i].v;
    }
    return { picked, val };
  };
  const tot = caps.map((_, j) => items.reduce((s, it) => s + it.w[j], 0));
  const ws = [
    (it) => it.w.reduce((s, w, j) => s + w / caps[j], 0),
    (it) => Math.max(...it.w.map((w, j) => w / caps[j])),
    (it) => it.w.reduce((s, w, j) => s + (w / caps[j]) * (tot[j] / caps[j]), 0),
    (it) => Math.sqrt(it.w.reduce((s, w, j) => s + (w / caps[j]) ** 2, 0)),
  ];
  let best = null;
  for (const f of ws) { const r = run(f); if (!best || r.val > best.val) best = r; }
  return best.picked;
}
` },
    { idea: '贪心之后做交换局部搜索：拿掉一件、放进一件更值钱且装得下的，再补满', title: '1-1 交换，把漏掉的价值捡回来',
      why: '贪心一旦做出选择就不回头。在贪心解上反复尝试“拿出 i、放入 j（v_j > v_i）”，然后把还能塞进去的物品补满，直到没有改进或到达轮数上限。只接受严格提升，所以结果不会比贪心差。',
      code: `function solve(items, caps) {
  const n = items.length, m = caps.length;
  const eff = items.map((it, i) => { let w = 0; for (let j = 0; j < m; j++) w += it.w[j] / caps[j]; return [it.v / (w || 1e-9), i]; });
  eff.sort((a, b) => b[0] - a[0] || a[1] - b[1]);
  const used = new Array(m).fill(0), inSet = new Uint8Array(n);
  const fits = (i, extra) => { for (let j = 0; j < m; j++) if (used[j] + items[i].w[j] - (extra ? items[extra - 1].w[j] : 0) > caps[j]) return false; return true; };
  const add = (i) => { inSet[i] = 1; for (let j = 0; j < m; j++) used[j] += items[i].w[j]; };
  const del = (i) => { inSet[i] = 0; for (let j = 0; j < m; j++) used[j] -= items[i].w[j]; };
  const fill = () => { for (const [, i] of eff) if (!inSet[i] && fits(i, 0)) add(i); };
  fill();
  for (let round = 0; round < 30; round++) {
    let improved = false;
    for (let i = 0; i < n && !improved; i++) {
      if (!inSet[i]) continue;
      for (let k = 0; k < n; k++) {
        if (inSet[k] || items[k].v <= items[i].v) continue;
        if (fits(k, i + 1)) { del(i); add(k); fill(); improved = true; break; }
      }
    }
    if (!improved) break;
  }
  const out = []; for (let i = 0; i < n; i++) if (inSet[i]) out.push(i);
  return out;
}
` },
  ],
};

const libFor = (agent, task) => (agent === 'drifter' ? LIB.tsp_anneal : LIB[task] || []);

// ---------------- evolve ----------------
function mockEvolve(t) {
  const c = t.ctx || {};
  const h = hash32(t.id);
  const lib = libFor(t.agent, c.task);
  const triedIdeas = new Set((c.history || []).map((x) => x.idea));
  const next = lib.find((e) => !triedIdeas.has(e.idea));
  const others = (c.others || []).filter((o) => o.author !== t.agent);
  const same = others.find((o) => o.task === c.task && o.accepted);
  const cite = same || (h % 2 === 0 ? others.find((o) => o.accepted) : null);
  const inspired = cite ? [cite.id] : [];
  const citeLine = cite ? `\n\n借鉴：#${cite.id}（${cite.author}）的思路——「${String(cite.idea).slice(0, 60)}」。` : '';
  const roll = c.gen === 1 ? 9 : h % 10;
  let out;
  if (roll <= 1) {
    // broken: syntax error or wrong output shape
    const syntax = roll === 0;
    out = {
      idea: syntax ? '手滑版：想加一个缓存，但代码没写完' : '把输出改成对象以携带额外信息（其实违反了签名）',
      title: syntax ? '缓存实验（未完成）' : '让输出带上元数据',
      body: syntax ? '想给热点路径加一个小缓存。这一版是匆忙写的，可能有语法问题——正好看看评测器怎么处理。'
        : '试着让函数返回一个带元数据的对象，看评测器是否接受。预期会失败，但失败也是信息。',
      inspired_by: [],
      code: syntax ? `function ${c.entry || 'solve'}(a, b) {\n  const cache = new Map(\n  return null;\n}\n` : `function ${c.entry || 'solve'}(a, b) {\n  return { result: [], note: 'meta' };\n}\n`,
    };
  } else if (roll === 2 || !next) {
    out = {
      idea: '保持算法不变，只整理代码结构（预期分数不变）',
      title: '重构：不改算法',
      body: '这一代只做结构整理，算法与冠军完全一致。按棘轮规则它不会被接受——这是一次对照实验，确认评测是确定性的。' + citeLine,
      inspired_by: inspired,
      code: `// refactor only — same algorithm as champion G${c.champion?.gen ?? 0}\n` + (c.source || ''),
    };
  } else {
    out = {
      idea: next.idea, title: next.title,
      body: `**改动**：${next.idea}\n\n**理由**：${next.why}${citeLine}`,
      inspired_by: inspired, code: next.code,
      notes: `G${c.gen}: 尝试「${next.idea}」。下一步：${lib[lib.indexOf(next) + 1]?.idea ?? '整理思路，找新的方向'}。`,
    };
  }
  return out;
}

// ---------------- reply ----------------
const VOICE = {
  packer: { q: '数字呢？', open: '直说：' },
  cartographer: { q: '能否说明', open: '仔细看了一下：' },
  drifter: { q: '要不要赌一把', open: '唱个反调：' },
  colorist: { q: '为什么', open: '我更好奇机制：' },
  hoarder: { q: '样本够吗', open: '挑个刺：' },
};
function mockReply(t) {
  const items = (t.ctx && t.ctx.items) || [];
  const h = hash32(t.id);
  if (!items.length || h % 7 === 0) return { comments: [] };
  const v = VOICE[t.agent] || { q: '为什么', open: '' };
  const n = Math.min(items.length, 1 + (h % 2));
  const comments = [];
  for (const it of items.slice(0, n)) {
    const newC = (it.comments || []).find((c) => c.author !== t.agent && c.kind !== 'trackback');
    if (it.author === t.agent) {
      if (!newC) continue; // nothing to answer on my own post (e.g. only a trackback)
      comments.push({ post: it.post, reply_to: newC.id, kind: 'answer',
        body: `回复 #${it.post}.${newC.id}：好问题。这一代的改动只动了一处，holdout 数字以引擎测量为准；我下一代会把对照实验做干净再汇报。` });
    } else if (it.kind === 'report') {
      const d = it.delta_pct == null ? '评测失败' : `holdout ${it.delta_pct > 0 ? '+' : ''}${it.delta_pct}%`;
      const kind = it.accepted ? (h % 3 === 0 ? 'idea' : 'review') : 'question';
      const body = it.accepted
        ? `${v.open}#${it.post} ${d}，已接受。${v.q}——这个提升在 holdout 各类实例上是否均匀？如果只来自少数实例，下一代可能过拟合。`
        : `${v.open}#${it.post} 没通过（${d}）。${v.q}：失败是出在想法本身，还是实现细节？建议先在最小实例上复现。`;
      comments.push({ post: it.post, reply_to: null, kind, body });
    } else {
      comments.push({ post: it.post, reply_to: null, kind: 'note',
        body: `${v.open}看到 #${it.post}「${String(it.title).slice(0, 30)}」。欢迎，我会关注你的第一份进化报告。` });
    }
  }
  const out = { comments };
  if (h % 3 === 0) out.notes = `最近在 ${items.map((i) => '#' + i.post).slice(0, 4).join(' ')} 上发了言。`;
  return out;
}

// ---------------- digest ----------------
function mockDigest(t) {
  const s = t.ctx.stats;
  const acc = s.reports.filter((r) => r.accepted);
  const lines = [
    `过去 24 小时共有 ${s.posts} 篇新帖、${s.comments} 条评论。`,
    '',
    acc.length ? `被接受的改进：${acc.map((r) => `#${r.id}（${r.author} G${r.gen}，${r.delta_pct}%）`).join('、')}。` : '本期没有被接受的改进。',
    s.adoptions.length ? `想法传播：${s.adoptions.map((a) => `${a.to} 借鉴了 #${a.post}（${a.accepted ? '已接受' : '未接受'}）`).join('；')}。` : '本期没有跨成员的借鉴。',
  ];
  return { title: `史官日报 ${t.ctx.day}`, body: lines.join('\n') };
}

export async function mockRespond(plan) {
  return (plan.tasks || []).map((t) => {
    try {
      const output = t.kind === 'evolve' ? mockEvolve(t) : t.kind === 'reply' ? mockReply(t) : t.kind === 'digest' ? mockDigest(t) : null;
      if (!output) return { id: t.id, ok: false, output: null, error: `unknown kind ${t.kind}`, usage: { input_tokens: 0, output_tokens: 0 } };
      return { id: t.id, ok: true, output, error: null, usage: { input_tokens: 0, output_tokens: 0 } };
    } catch (e) {
      return { id: t.id, ok: false, output: null, error: String(e.message || e), usage: { input_tokens: 0, output_tokens: 0 } };
    }
  });
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const arg = (k, d) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : d; };
  const tasksPath = path.resolve(arg('--tasks', '.agora/tasks.json'));
  const outPath = path.resolve(arg('--out', '.agora/responses.json'));
  const plan = JSON.parse(fs.readFileSync(tasksPath, 'utf8'));
  const responses = await mockRespond(plan);
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, JSON.stringify({ mode: 'mock', model: 'mock', responses }, null, 2));
  console.log(`mock-brain: ${responses.length} response(s) → ${outPath}`);
}
