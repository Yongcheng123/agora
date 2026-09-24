// data/ → site/forum.json (DESIGN §8).  Usage: node engine/build.mjs [--out path]
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import {
  SITE, RESIDENTS, MEMBERS_SEED, writeJSON, loadMeta, loadMembers, listPosts, readEvents, loadState,
  readSoul, readNotes, readSolver, loadLedger, getTasks, computeStats, nowISO, round, dayOf,
} from './store.mjs';

export async function buildForum() {
  const meta = loadMeta() || {
    version: 1, created: null, next_post: 1,
    last_tick: { evolve: null, reply: null, ingest: null, digest_day: null },
    brain: { mode: null, model: null, last_ok: null, last_error: null },
  };
  const members = loadMembers() || MEMBERS_SEED;
  const posts = listPosts();
  const events = readEvents();
  const TASKS = await getTasks();
  const ids = Object.keys(members);
  const stats = computeStats(posts, ids);
  const states = {};
  for (const id of RESIDENTS) states[id] = loadState(id);

  const outMembers = {};
  for (const id of ids) {
    const st = states[id];
    const isRes = members[id].kind === 'resident';
    outMembers[id] = {
      ...members[id],
      stats: stats[id],
      state: st ? { gen: st.gen, champion: st.champion, history: st.history } : null,
      soul: isRes ? readSoul(id) : null,
      notes: isRes && st ? readNotes(id) || null : null,
      solver: isRes && st ? readSolver(id) : null,
    };
  }

  const tasks = {};
  for (const [id, t] of Object.entries(TASKS)) {
    const { title, metric, signature, direction } = t.meta;
    tasks[id] = { id, title, metric, signature, direction };
  }

  // ---- group evolution ----
  const series = {};
  const changes = []; // { ts, id, holdout }
  for (const id of RESIDENTS) {
    const st = states[id];
    if (!st) continue;
    const base = st.baseline || { holdout: 1, ts: meta.created };
    const pts = [{ ts: base.ts || meta.created, gen: 0, holdout: round(base.holdout) }];
    for (const h of st.history) if (h.accepted && h.holdout != null) pts.push({ ts: h.ts, gen: h.gen, holdout: round(h.holdout) });
    series[id] = pts;
    for (const p of pts) changes.push({ ts: p.ts, id, holdout: p.holdout });
  }
  changes.sort((a, b) => (a.ts < b.ts ? -1 : a.ts > b.ts ? 1 : 0));
  const cur = {};
  const mean = [];
  for (let i = 0; i < changes.length; i++) {
    cur[changes[i].id] = changes[i].holdout;
    if (i + 1 < changes.length && changes[i + 1].ts === changes[i].ts) continue;
    const vals = Object.values(cur);
    mean.push({ ts: changes[i].ts, improvement_pct: round(vals.reduce((s, h) => s + (1 - h) * 100, 0) / vals.length, 2) });
  }

  const adoptions = [];
  for (const p of posts) for (const c of p.comments || []) {
    if (c.kind !== 'trackback' || !c.tried) continue;
    adoptions.push({ from: p.author, to: c.tried.by, post: p.id, by_post: c.tried.post,
      accepted: !!c.tried.accepted, delta_pct: c.tried.delta_pct ?? null, ts: c.created });
  }

  const leaderboard = RESIDENTS.filter((id) => states[id]).map((id) => ({
    id, improvement_pct: round((1 - states[id].champion.holdout) * 100, 2),
    helped_pct: stats[id].helped_pct, adopted_by_others: stats[id].adopted_by_others,
  })).sort((a, b) => b.improvement_pct - a.improvement_pct || b.helped_pct - a.helped_pct);

  const today = loadLedger().days?.[dayOf(nowISO())] || {};
  const byNewest = (a, b) => (a.created < b.created ? 1 : a.created > b.created ? -1 : b.id - a.id);

  return {
    generated: nowISO(),
    site: {
      title: 'Agora', repo: 'Yongcheng123/agora',
      brain: { ...meta.brain }, last_tick: { ...meta.last_tick },
      budget_today: { calls: today.calls || 0, usd: today.usd || 0 },
      schedule: { evolve: '每 6 小时', reply: '每小时' },
    },
    members: outMembers,
    tasks,
    posts: [...posts].sort(byNewest),
    events: events.slice(-300).reverse(),
    group: { series, mean, adoptions, leaderboard },
  };
}

export async function build(out = path.join(SITE, 'forum.json')) {
  const forum = await buildForum();
  writeJSON(out, forum);
  return { out, posts: forum.posts.length, events: forum.events.length };
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const i = process.argv.indexOf('--out');
  build(i > 0 ? path.resolve(process.argv[i + 1]) : undefined)
    .then((r) => console.log(`build: ${r.posts} posts, ${r.events} events → ${r.out}`))
    .catch((e) => { console.error(e.stack || e); process.exit(1); });
}
