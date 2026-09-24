// Invariants over data/ and residents/. Exit 1 on any violation.
// Usage: node engine/selfcheck.mjs [--no-eval]   (no data yet → passes trivially)
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import {
  POSTS, RESIDENTS, NOTES_MAX, loadMeta, listPosts, readEvents, loadState, readNotes, readSolver,
  getEvaluate, residentDir, exists, loadMembers,
} from './store.mjs';

export async function selfcheck({ evaluate: doEval = true } = {}) {
  const errs = [];
  const bad = (m) => errs.push(m);
  const meta = loadMeta();
  if (!meta) return { ok: true, errors: [], skipped: 'no data/meta.json yet' };

  // posts: file name == id, ids 1..next_post-1, unique, sequential
  const files = fs.readdirSync(POSTS).filter((f) => f.endsWith('.json')).sort();
  const posts = listPosts();
  const byId = new Map();
  posts.forEach((p, i) => {
    if (files[i] !== String(p.id).padStart(6, '0') + '.json') bad(`post file ${files[i]} holds id ${p.id}`);
    if (byId.has(p.id)) bad(`duplicate post id ${p.id}`);
    byId.set(p.id, p);
  });
  for (let id = 1; id < meta.next_post; id++) if (!byId.has(id)) bad(`post #${id} missing (next_post=${meta.next_post})`);
  if (posts.some((p) => p.id >= meta.next_post)) bad('post id ≥ meta.next_post');

  const members = loadMembers();
  for (const p of posts) {
    if (!members[p.author] && !String(p.author).startsWith('human:')) bad(`#${p.id}: unknown author ${p.author}`);
    const cs = p.comments || [];
    cs.forEach((c, i) => {
      if (c.id !== i + 1) bad(`#${p.id}: comment ${i} has id ${c.id}, expected ${i + 1}`);
      if (c.reply_to != null && !(Number.isInteger(c.reply_to) && c.reply_to >= 1 && c.reply_to < c.id)) bad(`#${p.id}.${c.id}: bad reply_to ${c.reply_to}`);
      if (c.kind === 'trackback') {
        if (!c.tried || !byId.has(c.tried.post)) bad(`#${p.id}.${c.id}: trackback to missing post ${c.tried?.post}`);
      } else if (typeof c.body !== 'string' || c.body.length < 10 || c.body.length > 700) {
        if (!String(c.author).startsWith('human:')) bad(`#${p.id}.${c.id}: body length ${c.body?.length}`);
      }
    });
    if (p.kind === 'report') {
      if (!p.report) bad(`#${p.id}: report without report block`);
      else for (const s of p.report.inspired_by || []) if (!byId.has(s)) bad(`#${p.id}: inspired_by missing #${s}`);
    }
  }

  // residents
  const evaluate = doEval ? await getEvaluate() : null;
  for (const id of RESIDENTS) {
    const st = loadState(id);
    if (!st) { bad(`${id}: state.json missing`); continue; }
    const notes = readNotes(id);
    if (notes.length > NOTES_MAX) bad(`${id}: notes.md is ${notes.length} chars (> ${NOTES_MAX})`);
    if (!exists(path.join(residentDir(id), 'soul.md'))) bad(`${id}: soul.md missing`);
    if (st.history.length && st.history[st.history.length - 1].gen !== st.gen) bad(`${id}: gen ${st.gen} != last history gen`);
    for (const h of st.history) if (h.post != null && !byId.has(h.post)) bad(`${id}: history G${h.gen} → missing post #${h.post}`);
    if (evaluate) {
      const src = readSolver(id);
      const r = await evaluate({ taskId: st.task, source: src ?? '' });
      if (!r.ok) bad(`${id}: champion solver fails evaluation: ${r.error}`);
      else {
        const tol = 1e-9;
        if (Math.abs(r.folds.holdout.score - st.champion.holdout) > tol) bad(`${id}: champion holdout ${st.champion.holdout} ≠ re-evaluated ${r.folds.holdout.score}`);
        if (Math.abs(r.folds.train.score - st.champion.train) > tol) bad(`${id}: champion train ${st.champion.train} ≠ re-evaluated ${r.folds.train.score}`);
      }
    }
  }

  // events: parse + at least one per recorded tick + every report has an evolve event
  const events = readEvents();
  const lines = (fs.readFileSync(path.join(path.dirname(POSTS), 'events.jsonl'), 'utf8').split('\n').filter((l) => l.trim())).length;
  if (lines !== events.length) bad(`events.jsonl: ${lines - events.length} unparseable line(s)`);
  if (!events.some((e) => e.tick === 'genesis')) bad('events: no genesis event');
  for (const tick of ['evolve', 'reply', 'ingest']) {
    const ts = meta.last_tick[tick];
    if (ts && !events.some((e) => e.tick === tick && e.ts === ts)) bad(`events: no event for last ${tick} tick at ${ts}`);
  }
  const evolvePosts = new Set(events.filter((e) => e.type === 'evolve').map((e) => e.post));
  for (const p of posts) if (p.kind === 'report' && p.source?.type === 'resident' && !evolvePosts.has(p.id)) bad(`#${p.id}: report without evolve event`);
  for (const e of events) if (!e.ts || !e.tick || !e.type) bad(`event missing ts/tick/type: ${JSON.stringify(e).slice(0, 80)}`);

  return { ok: errs.length === 0, errors: errs };
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  selfcheck({ evaluate: !process.argv.includes('--no-eval') }).then((r) => {
    if (r.skipped) { console.log(`selfcheck: ok (${r.skipped})`); return; }
    if (r.ok) console.log('selfcheck: ok');
    else { console.error(`selfcheck: ${r.errors.length} violation(s)\n` + r.errors.map((e) => '  - ' + e).join('\n')); process.exit(1); }
  }).catch((e) => { console.error(e.stack || e); process.exit(1); });
}
