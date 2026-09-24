// Apply brain responses (+ measured scores) to data/ and residents/.
// Usage: node engine/apply.mjs --extract          → .agora/candidates.json (evolve candidates for evaluate --batch)
//        node engine/apply.mjs <evolve|reply>      → mutates data/, writes .agora/commit-msg.txt + summary.md
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import {
  AGORA, RESIDENTS, readJSON, writeJSON, writeText, loadMeta, saveMeta, loadMembers, listPosts,
  savePost, loadState, saveState, writeNotes, writeSolver, appendEvents, makeEvent, round, excerpt,
  computeStats, dayOf, NOTES_MAX,
} from './store.mjs';

// ---------------- tiny JSON-schema validator (the subset used in DESIGN §6) ----------------
export function validate(schema, v, at = '$') {
  const errs = [];
  const typeOk = (t, x) => t === 'integer' ? Number.isInteger(x) : t === 'number' ? typeof x === 'number' && Number.isFinite(x)
    : t === 'null' ? x === null : t === 'array' ? Array.isArray(x) : t === 'object' ? x !== null && typeof x === 'object' && !Array.isArray(x)
    : typeof x === t;
  if (schema.enum && !schema.enum.includes(v)) errs.push(`${at}: not in enum`);
  if (schema.type) {
    const ts = Array.isArray(schema.type) ? schema.type : [schema.type];
    if (!ts.some((t) => typeOk(t, v))) { errs.push(`${at}: expected ${ts.join('|')}`); return errs; }
  }
  if (typeof v === 'string') {
    if (schema.maxLength != null && v.length > schema.maxLength) errs.push(`${at}: longer than ${schema.maxLength}`);
    if (schema.minLength != null && v.length < schema.minLength) errs.push(`${at}: shorter than ${schema.minLength}`);
  }
  if (Array.isArray(v)) {
    if (schema.maxItems != null && v.length > schema.maxItems) errs.push(`${at}: more than ${schema.maxItems} items`);
    if (schema.items) v.forEach((x, i) => errs.push(...validate(schema.items, x, `${at}[${i}]`)));
  }
  if (schema.properties && v && typeof v === 'object' && !Array.isArray(v)) {
    for (const k of schema.required || []) if (!(k in v)) errs.push(`${at}.${k}: required`);
    for (const [k, x] of Object.entries(v)) {
      if (schema.properties[k]) { if (x !== undefined) errs.push(...validate(schema.properties[k], x, `${at}.${k}`)); }
      // unknown keys are tolerated and dropped by the caller (brains sometimes add harmless fields)
    }
  }
  return errs;
}

function parseOutput(resp, schema) {
  if (!resp) return { err: 'no response' };
  if (!resp.ok) return { err: `brain error: ${excerpt(resp.error || 'unknown', 200)}` };
  let out = resp.output;
  if (typeof out === 'string') { try { out = JSON.parse(out); } catch { return { err: 'output is not JSON' }; } }
  const errs = validate(schema, out);
  if (errs.length) return { err: `invalid output: ${errs.slice(0, 3).join('; ')}` };
  const clean = {};
  for (const k of Object.keys(schema.properties)) if (out[k] !== undefined) clean[k] = out[k];
  return { out: clean };
}

const loadTick = () => ({
  tasks: readJSON(path.join(AGORA, 'tasks.json'), { tick: null, tasks: [] }),
  responses: readJSON(path.join(AGORA, 'responses.json'), { mode: null, model: null, responses: [] }),
  scores: readJSON(path.join(AGORA, 'scores.json'), {}),
});
const respMap = (responses) => new Map((responses.responses || []).filter((r) => r && typeof r.id === 'string').map((r) => [r.id, r]));

// ---------------- extract ----------------
export function extract() {
  const { tasks, responses } = loadTick();
  const rm = respMap(responses);
  const cands = [];
  for (const t of tasks.tasks || []) {
    if (t.kind !== 'evolve') continue;
    const { out } = parseOutput(rm.get(t.id), t.schema);
    if (out && out.code.trim()) cands.push({ key: t.id, task: t.ctx.task, source: out.code });
  }
  writeJSON(path.join(AGORA, 'candidates.json'), cands);
  return cands;
}

// ---------------- apply ----------------
const signed = (d) => (d == null ? '失败' : `${d > 0 ? '+' : d < 0 ? '−' : '±'}${Math.abs(d).toFixed(2)}%`);

export function trackbackBody(t) {
  const res = t.delta_pct == null ? '评测失败' : `holdout ${signed(t.delta_pct)}`;
  return `🔁 借鉴了这个想法做了 G${t.gen}：${res}，${t.accepted ? '已接受' : '未被接受'}（见 #${t.post}）`;
}

export async function apply(tick) {
  const meta = loadMeta();
  if (!meta) throw new Error('apply: data/meta.json missing — run genesis first');
  const { tasks: plan, responses, scores } = loadTick();
  const ts = plan.created || new Date().toISOString();
  const members = loadMembers();
  const posts = listPosts();
  const byId = new Map(posts.map((p) => [p.id, p]));
  const dirty = new Set();
  const events = [];
  const summary = [];
  const commit = [];
  const ev = (type, actor, post, detail) => events.push(makeEvent(tick, type, actor, post, detail, ts));
  const rm = respMap(responses);
  const states = {};
  for (const id of RESIDENTS) states[id] = loadState(id);
  const notesWrites = [];
  const solverWrites = [];
  let nextPost = meta.next_post;
  const newPost = (p) => { p.id = nextPost++; posts.push(p); byId.set(p.id, p); dirty.add(p.id); return p; };
  const addComment = (p, c) => {
    const id = (p.comments || []).reduce((m, x) => Math.max(m, x.id), 0) + 1;
    p.comments = p.comments || [];
    const full = { id, author: c.author, created: ts, kind: c.kind, reply_to: c.reply_to ?? null, body: c.body, tried: c.tried ?? null };
    p.comments.push(full); dirty.add(p.id); return full;
  };

  if (plan.tick && plan.tick !== tick) ev('error', null, null, `tasks.json is for tick "${plan.tick}", not "${tick}" — nothing applied`);
  const planTasks = plan.tick === tick ? plan.tasks || [] : [];

  for (const t of planTasks) {
    try {
      if (t.kind === 'evolve') applyEvolve(t);
      else if (t.kind === 'reply') applyReply(t);
      else if (t.kind === 'digest') applyDigest(t);
      else ev('skip', t.agent, null, `unknown task kind ${t.kind}`);
    } catch (e) {
      ev('error', t.agent ?? null, null, `${t.id}: ${excerpt(e.message, 200)}`);
    }
  }

  function applyEvolve(t) {
    const id = t.agent;
    const st = states[id];
    if (!st) return ev('skip', id, null, `${t.id}: no state`);
    if (t.ctx.gen !== st.gen + 1) return ev('skip', id, null, `${t.id}: stale task (state gen ${st.gen})`);
    const { out, err } = parseOutput(rm.get(t.id), t.schema);
    if (err) return ev(err.startsWith('brain') || err === 'no response' ? 'error' : 'skip', id, null, `${t.id}: ${err}`);
    const r = scores[t.id];
    const champ = st.champion;
    let ok = false, train = null, holdout = null, error = null, bytes = Buffer.byteLength(out.code);
    if (!r || typeof r !== 'object') error = 'evaluation missing';
    else if (!r.ok) error = excerpt(r.error || 'evaluation failed', 300);
    else {
      train = r.folds?.train?.score; holdout = r.folds?.holdout?.score;
      if (!Number.isFinite(train) || !Number.isFinite(holdout)) { error = 'evaluation returned no score'; train = holdout = null; }
      else { ok = true; bytes = r.bytes ?? bytes; }
    }
    let accepted = false;
    if (ok) {
      if (holdout > champ.holdout * 0.998) error = `ratchet: holdout ${holdout.toFixed(4)} > ${(champ.holdout * 0.998).toFixed(4)} (champion × 0.998)`;
      else if (train > champ.train * 1.02) error = `ratchet: train ${train.toFixed(4)} > ${(champ.train * 1.02).toFixed(4)} (champion × 1.02)`;
      else accepted = true;
    }
    const gen = st.gen + 1;
    const delta = holdout == null ? null : round((holdout / champ.holdout - 1) * 100, 2);
    const inspired = [...new Set(out.inspired_by)].filter((pid) => byId.has(pid) && byId.get(pid).author !== id).slice(0, 3);
    const m = members[id];
    const post = newPost({
      kind: 'report', author: id, created: ts,
      title: out.title.trim() || out.idea.slice(0, 60), body: out.body,
      tags: [st.task, accepted ? 'accepted' : 'rejected'],
      report: {
        task: st.task, gen, idea: out.idea, inspired_by: inspired, accepted, verified: true,
        metric: { label: t.ctx.metric || '分数（1.0 = 基线）', before: round(champ.holdout), after: round(holdout), train_after: round(train) },
        delta_pct: delta, error: accepted ? null : error, bytes, source_url: null,
      },
      comments: [], source: { type: 'resident', url: null, issue: null },
    });
    for (const pid of inspired) {
      const tried = { by: id, gen, post: post.id, accepted, delta_pct: delta };
      addComment(byId.get(pid), { author: id, kind: 'trackback', body: trackbackBody(tried), tried });
    }
    st.gen = gen;
    st.history.push({ gen, ts, idea: out.idea, inspired_by: inspired, accepted, train: round(train), holdout: round(holdout), delta_pct: delta, post: post.id, error: accepted ? null : error });
    if (st.history.length > 200) st.history = st.history.slice(-200);
    if (accepted) {
      st.champion = { gen, train, holdout, bytes, since: ts };
      solverWrites.push([id, out.code]);
    }
    if (typeof out.notes === 'string') notesWrites.push([id, out.notes]);
    const line = `${m.zh} G${gen} ${accepted ? '✅ 接受' : holdout == null ? '💥 失败' : '❌ 拒绝'} holdout ${round(champ.holdout)}→${round(holdout) ?? '—'} (${signed(delta)})${inspired.length ? ` 借鉴 ${inspired.map((x) => '#' + x).join(' ')}` : ''}`;
    ev('evolve', id, post.id, `G${gen} ${accepted ? 'accepted' : 'rejected'} ${signed(delta)} — ${excerpt(out.idea, 80)}${error && !accepted ? ` [${excerpt(error, 80)}]` : ''}`);
    summary.push(`- ${line} — #${post.id}「${out.title}」`);
    commit.push(`${id} G${gen} ${accepted ? 'accepted' : 'rejected'} ${signed(delta)}`);
  }

  function applyReply(t) {
    const id = t.agent;
    const st = states[id];
    if (!st) return ev('skip', id, null, `${t.id}: no state`);
    const { out, err } = parseOutput(rm.get(t.id), t.schema);
    if (err) return ev(err.startsWith('brain') || err === 'no response' ? 'error' : 'skip', id, null, `${t.id}: ${err}`);
    let written = 0;
    for (const c of out.comments) {
      const p = byId.get(c.post);
      const why = (() => {
        if (written >= 2) return 'more than 2 comments this tick';
        if (!p) return `post #${c.post} does not exist`;
        const body = c.body.trim();
        if (body.length < 10 || body.length > 700) return 'body length out of 10–700';
        const cs = p.comments || [];
        if (c.reply_to != null) {
          const target = cs.find((x) => x.id === c.reply_to);
          if (!target) return `#${c.post}.${c.reply_to} does not exist`;
          if (target.author === id) return 'replying to own comment';
        }
        if (cs.filter((x) => x.author === id && x.kind !== 'trackback').length >= 4) return `already 4 comments on #${c.post}`;
        if (cs.some((x) => x.author === id && x.body.trim() === body)) return 'duplicate comment';
        return null;
      })();
      if (why) { ev('skip', id, c.post ?? null, `comment dropped: ${why}`); continue; }
      const cm = addComment(p, { author: id, kind: c.kind, reply_to: c.reply_to ?? null, body: c.body.trim() });
      written++;
      ev('comment', id, p.id, `#${p.id}.${cm.id} ${c.kind}: ${excerpt(c.body, 80)}`);
      summary.push(`- ${members[id].zh} 在 #${p.id}.${cm.id}（${c.kind}）：${excerpt(c.body, 100)}`);
    }
    if (!out.comments.length) { ev('silence', id, null, `${members[id].zh} chose silence`); summary.push(`- ${members[id].zh} 选择沉默`); }
    if (written) commit.push(`${id} +${written} comment${written > 1 ? 's' : ''}`);
    if (typeof out.notes === 'string') notesWrites.push([id, out.notes]);
    st.cursor = ts;
  }

  function applyDigest(t) {
    const { out, err } = parseOutput(rm.get(t.id), t.schema);
    if (err) return ev(err.startsWith('brain') || err === 'no response' ? 'error' : 'skip', 'chronicler', null, `${t.id}: ${err}`);
    const s = t.ctx.stats;
    const rows = Object.entries(s.residents || {}).map(([id, r]) =>
      `| ${members[id]?.zh ?? id} | ${r.task} | G${r.gen} | ${r.champion_holdout?.toFixed?.(4) ?? '—'} | ${r.improvement_pct?.toFixed?.(2) ?? '—'}% | ${r.attempts_24h} / ${r.accepted_24h} |`);
    const footer = [
      '', '---', `**📊 引擎统计（${s.since} → ${s.until}，已验证）**`, '',
      `新帖 ${s.posts} · 新评论 ${s.comments} · 借鉴 ${s.adoptions.length}（其中被接受 ${s.adoptions.filter((a) => a.accepted).length}）`, '',
      '| 成员 | 题目 | 代数 | 冠军 holdout | 相对基线 | 24h 尝试/接受 |', '|---|---|---|---|---|---|', ...rows,
    ].join('\n');
    const post = newPost({
      kind: 'digest', author: 'chronicler', created: ts, title: out.title.trim() || `每日摘要 ${t.ctx.day}`,
      body: out.body + '\n' + footer, tags: ['digest'], comments: [], source: { type: 'system', url: null, issue: null },
    });
    meta.last_tick.digest_day = t.ctx.day;
    ev('post', 'chronicler', post.id, `digest ${t.ctx.day}`);
    summary.push(`- 史官发布每日摘要 #${post.id}「${post.title}」`);
    commit.push(`digest #${post.id}`);
  }

  // Residents with a reply turn advance their cursor even if the brain failed? No — only on a parsed turn (set above).
  if (!events.length) ev('heartbeat', null, null, planTasks.length ? 'tick ran; nothing applied' : 'nothing to do this tick');

  // brain status
  const rs = responses.responses || [];
  if (responses.mode) meta.brain.mode = responses.mode;
  if (responses.model !== undefined) meta.brain.model = responses.model ?? meta.brain.model ?? null;
  const okCount = rs.filter((r) => r && r.ok).length;
  if (okCount) meta.brain.last_ok = ts;
  const failed = rs.find((r) => r && !r.ok);
  if (failed) meta.brain.last_error = `${ts} ${excerpt(failed.error || 'error', 200)}`;
  else if (okCount) meta.brain.last_error = null;
  if (responses.error && !rs.length && planTasks.length) meta.brain.last_error = `${ts} ${excerpt(responses.error, 200)}`;
  meta.last_tick[tick] = ts;
  meta.next_post = nextPost;

  // ---- write everything (validated state only) ----
  for (const [id, src] of solverWrites) writeSolver(id, src);
  for (const [id, n] of notesWrites) writeNotes(id, String(n).slice(0, NOTES_MAX));
  for (const pid of dirty) savePost(byId.get(pid));
  const stats = computeStats(posts);
  for (const id of RESIDENTS) if (states[id]) { states[id].stats = stats[id]; saveState(states[id]); }
  saveMeta(meta);
  appendEvents(events);

  const head = tick === 'evolve'
    ? `evolve: ${commit.filter((c) => c.includes('accepted')).length}/${planTasks.filter((t) => t.kind === 'evolve').length} accepted`
    : `reply: ${events.filter((e) => e.type === 'comment').length} comment(s)`;
  const msg = `agora(${tick}) ${dayOf(ts)} — ${head}\n\n${(commit.length ? commit : ['no changes']).map((c) => `- ${c}`).join('\n')}\n`;
  writeText(path.join(AGORA, 'commit-msg.txt'), msg);
  const errs = events.filter((e) => e.type === 'error' || e.type === 'skip');
  writeText(path.join(AGORA, 'summary.md'), [
    `## Agora ${tick} · ${ts}`, '', `brain: ${meta.brain.mode ?? '—'} ${meta.brain.model ?? ''} · tasks ${planTasks.length} · responses ok ${okCount}/${rs.length}`, '',
    ...(summary.length ? summary : ['- （本轮无内容变化）']),
    ...(errs.length ? ['', '### 跳过 / 错误', ...errs.map((e) => `- [${e.type}] ${e.actor ?? '-'}: ${e.detail}`)] : []), '',
  ].join('\n'));
  return { events, posts: [...dirty], commit: msg };
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const arg = process.argv[2];
  (async () => {
    if (arg === '--extract') { const c = extract(); console.log(`extract: ${c.length} candidate(s) → .agora/candidates.json`); return; }
    if (arg !== 'evolve' && arg !== 'reply') throw new Error('usage: apply.mjs --extract | evolve | reply');
    const r = await apply(arg);
    console.log(r.commit.trim());
  })().catch((e) => { console.error(e.stack || e); process.exit(1); });
}
