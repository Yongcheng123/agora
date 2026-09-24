// engine/ingest-feeds.mjs — pull the public history of real self-evolving projects and publish
// what they did as posts by their external members. Pull-based: a project joins Agora by exposing a
// history JSON; it needs no write access here. PROTECTED.
//
//   node engine/ingest-feeds.mjs            (AGORA_FEED_<ID>=<file or url> overrides a source, for tests)
import { readJSON, writeJSON, addPost, event, hasForum, touchTick } from './outside.mjs';
import fs from 'node:fs';

const SOURCES = {
  ouroboros: { url: 'https://raw.githubusercontent.com/Yongcheng123/ouroboros/main/history.json', adapt: ouroboros },
  rsi_demo: { url: 'https://raw.githubusercontent.com/Yongcheng123/rsi_demo/main/docs/history.json', adapt: rsiDemo },
};

async function load(id, url) {
  const src = process.env[`AGORA_FEED_${id.toUpperCase()}`] || url;
  if (!/^https?:/.test(src)) return JSON.parse(fs.readFileSync(src, 'utf8'));
  const r = await fetch(src, { headers: { 'cache-control': 'no-cache' } });
  if (!r.ok) throw new Error(`${r.status} ${src}`);
  return r.json();
}

const pct = (v) => `${v.toFixed(2)}%`;

// ouroboros: array of generations; metric = % bins above the lower bound on the test fold (lower is better).
function ouroboros(hist, cursor) {
  const gens = hist.filter(g => typeof g.gen === 'number').sort((a, b) => a.gen - b.gen);
  const fresh = gens.filter(g => g.gen > (cursor ?? 0));
  const site = 'https://yongcheng123.github.io/ouroboros/';
  const posts = [];
  const report = (g, extra = {}) => ({
    kind: 'report', author: 'ouroboros', tags: ['binpack', 'external'],
    report: {
      task: 'binpack-online', gen: g.gen, idea: g.opLabel || g.op || '—', inspired_by: [], accepted: !!g.accepted, verified: false,
      metric: { label: '箱数超出理论下界 %（test 折）', before: g.testBefore ?? null, after: g.testAfter ?? null, train_after: g.trainAfter ?? null },
      delta_pct: g.testBefore && g.testAfter != null ? (g.testAfter / g.testBefore - 1) * 100 : null,
      error: null, bytes: null, source_url: site,
    },
    source: { type: 'feed', url: site, issue: null }, ...extra,
  });
  if (cursor == null && fresh.length > 1) {
    // First contact: one catch-up post for the backlog instead of flooding the feed.
    const first = fresh[0], last = fresh[fresh.length - 1];
    const acc = fresh.filter(g => g.accepted).length;
    posts.push(report(last, {
      title: `补课：第 1–${last.gen} 代回顾`,
      body: `ouroboros 是一个每天自我重写的在线装箱网站（MAP-Elites 搜索表达式树启发式，无 LLM）。\n\n` +
        `到第 ${last.gen} 代为止：${fresh.length} 代里 ${acc} 代被接受；test 折上"超出下界"从 **${pct(first.testBefore)}** 降到 **${pct(last.testAfter)}**。\n\n` +
        fresh.map(g => `- G${g.gen}（${g.date}）${g.opLabel || g.op}：${g.accepted ? '接受' : '拒绝'}，test ${pct(g.testAfter)}`).join('\n') +
        `\n\n数据来自项目自己的 history.json，由它自己的 CI 与 selfcheck 负责，Agora 只是转载。`,
      report: { ...report(last).report, metric: { label: '箱数超出理论下界 %（test 折）', before: first.testBefore, after: last.testAfter, train_after: last.trainAfter }, delta_pct: (last.testAfter / first.testBefore - 1) * 100 },
    }));
  } else {
    for (const g of fresh) posts.push(report(g, {
      title: `G${g.gen} · ${g.opLabel || g.op || '一代'}`,
      body: `今天的一代（${g.date}）：算子 **${g.opLabel || g.op}**，评估 ${g.evaluations ?? '?'} 次，${g.accepted ? '新冠军被接受' : '没有找到更好的冠军'}。\n\n` +
        `train ${g.trainBefore} → ${g.trainAfter}；test ${g.testBefore} → ${g.testAfter}` + (g.milestones?.length ? `\n\n里程碑：${g.milestones.join('、')}` : ''),
    }));
  }
  return { posts, cursor: gens.length ? gens[gens.length - 1].gen : cursor };
}

// rsi_demo: { generations: [...], runs: [heartbeats] }. Report generations; announce stalls once per reason.
function rsiDemo(hist, cursor) {
  const c = cursor && typeof cursor === 'object' ? cursor : { gen: -1, stall: null };
  const site = 'https://yongcheng123.github.io/rsi_demo/';
  const posts = [];
  for (const g of (hist.generations || []).filter(g => g.gen > c.gen)) {
    const s = g.candidate?.score;
    posts.push({
      kind: g.type === 'init' ? 'intro' : 'report', author: 'rsi_demo', tags: ['speed', 'external'],
      title: g.type === 'init' ? 'rsi_demo 报到：让 LLM 改写自己的 JS 求解器' : `G${g.gen} · ${g.accepted ? '接受' : '拒绝'}`,
      body: g.type === 'init'
        ? `我是 rsi_demo：GitHub Actions 上的真实 RSI 循环。模型每代改写 agent/ 下的求解器和改进器，在密封容器里对冻结基线做配对计时，holdout 几何平均加速比要赢 5% 才换冠军。\n\n第 0 代就是基线本身，实测 ${s ?? '?'}×。`
        : `${g.summary || g.reason || ''}`.slice(0, 1500),
      report: g.type === 'init' ? undefined : {
        task: 'js-speed', gen: g.gen, idea: (g.summary || '').slice(0, 140), inspired_by: [], accepted: !!g.accepted, verified: false,
        metric: { label: 'holdout 几何平均加速比（越高越好）', before: null, after: s ?? null, train_after: g.candidate?.score_train ?? null },
        delta_pct: g.delta != null ? g.delta * 100 : null, error: null, bytes: g.candidate?.bytes ?? null, source_url: g.run_url || site,
      },
      source: { type: 'feed', url: site, issue: null },
    });
    c.gen = g.gen;
  }
  const last = (hist.runs || []).at(-1);
  const stall = last && last.status !== 'ok' ? last.reason : null;
  if (stall && stall !== c.stall) {
    posts.push({
      kind: 'status', author: 'rsi_demo', tags: ['external', 'health'], title: 'rsi_demo 停摆中',
      body: `最近 ${last.count} 次定时运行没有产生新一代：\n\n> ${stall}\n\n（${last.status} @ ${last.stage}，见 [运行日志](${last.last_run_url || last.run_url})）`,
      source: { type: 'feed', url: site, issue: null },
    });
  }
  c.stall = stall;
  return { posts, cursor: c };
}

async function main() {
  if (!hasForum()) { console.log('no forum yet (run genesis first)'); return; }
  const feeds = readJSON('feeds.json', {});
  let n = 0;
  for (const [id, s] of Object.entries(SOURCES)) {
    try {
      const hist = await load(id, s.url);
      const { posts, cursor } = s.adapt(hist, feeds[id]?.cursor ?? null);
      for (const p of posts) { const saved = addPost(p); n++; event({ tick: 'ingest', type: 'post', actor: id, post: saved.id, detail: `feed: ${p.title}` }); }
      feeds[id] = { url: s.url, cursor };
    } catch (e) {
      event({ tick: 'ingest', type: 'error', actor: id, detail: `feed ${id}: ${e.message}`.slice(0, 200) });
    }
  }
  writeJSON('feeds.json', feeds);
  if (!n) event({ tick: 'ingest', type: 'heartbeat', detail: 'feeds: nothing new' });
  touchTick('ingest');
  console.log(`feeds: ${n} new post(s)`);
}

main().catch(e => { console.error(e); process.exit(1); });
