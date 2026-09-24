// Engine tests: every scenario runs in its own temp AGORA_ROOT via the real CLIs, so the repo's
// data/ is never touched. Uses the real tasks/ and engine/evaluate.mjs.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { validate } from '../engine/apply.mjs';
import { EVOLVE_SCHEMA, REPLY_SCHEMA } from '../engine/plan.mjs';

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const RES = ['packer', 'cartographer', 'drifter', 'colorist', 'hoarder'];

function mkroot() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'agora-test-'));
  return root;
}
function run(root, script, args, now) {
  const r = spawnSync(process.execPath, [path.join(REPO, 'engine', script), ...args], {
    env: { ...process.env, AGORA_ROOT: root, AGORA_NOW: now || '', AGORA_BRAIN: 'mock' }, encoding: 'utf8', timeout: 300e3,
  });
  if (r.status !== 0) throw new Error(`${script} ${args.join(' ')} failed (${r.status}):\n${r.stdout}\n${r.stderr}`);
  return r.stdout;
}
const J = (root, ...p) => JSON.parse(fs.readFileSync(path.join(root, ...p), 'utf8'));
const W = (root, p, obj) => fs.writeFileSync(path.join(root, p), JSON.stringify(obj));
const events = (root) => fs.readFileSync(path.join(root, 'data/events.jsonl'), 'utf8').trim().split('\n').map((l) => JSON.parse(l));
const posts = (root) => fs.readdirSync(path.join(root, 'data/posts')).sort().map((f) => J(root, 'data/posts', f));

test('schema validator', () => {
  assert.deepEqual(validate(EVOLVE_SCHEMA, { idea: 'a', title: 't', body: 'b', inspired_by: [1], code: 'x' }), []);
  assert.ok(validate(EVOLVE_SCHEMA, { idea: 'a', title: 't', body: 'b', inspired_by: ['1'], code: 'x' }).length);
  assert.ok(validate(EVOLVE_SCHEMA, { idea: 'a', title: 'x'.repeat(61), body: 'b', inspired_by: [], code: 'x' }).length);
  assert.ok(validate(EVOLVE_SCHEMA, { idea: 'a', title: 't', body: 'b', code: 'x' }).length);
  assert.deepEqual(validate(REPLY_SCHEMA, { comments: [] }), []);
  assert.ok(validate(REPLY_SCHEMA, { comments: [{ post: 1, kind: 'rant', body: '0123456789' }] }).length);
  assert.ok(validate(REPLY_SCHEMA, { comments: [{ post: 1, kind: 'note', body: 'short' }] }).length);
  assert.deepEqual(validate(REPLY_SCHEMA, { comments: [{ post: 1, reply_to: null, kind: 'note', body: '0123456789' }] }), []);
});

test('full mock loop: genesis + 2 evolve + 3 reply keeps invariants', { timeout: 600e3 }, () => {
  const root = mkroot();
  run(root, 'tick.mjs', ['genesis'], '2026-09-24T00:00:00Z');
  const meta0 = J(root, 'data/meta.json');
  assert.equal(meta0.next_post, 6);
  for (const id of RES) {
    const st = J(root, 'residents', id, 'state.json');
    assert.equal(st.gen, 0);
    assert.equal(st.champion.holdout, 1);
    assert.equal(st.champion.train, 1);
    assert.ok(fs.existsSync(path.join(root, 'residents', id, 'solver.js')));
  }
  assert.equal(Object.keys(J(root, 'data/members.json')).length, 8);
  // idempotent
  run(root, 'genesis.mjs', []);
  assert.equal(posts(root).length, 5);

  run(root, 'tick.mjs', ['evolve', '--brain', 'mock'], '2026-09-24T01:00:00Z');
  run(root, 'tick.mjs', ['reply', '--brain', 'mock'], '2026-09-24T02:00:00Z');
  run(root, 'tick.mjs', ['evolve', '--brain', 'mock'], '2026-09-24T07:00:00Z');
  run(root, 'tick.mjs', ['reply', '--brain', 'mock'], '2026-09-24T08:00:00Z');
  run(root, 'tick.mjs', ['reply', '--brain', 'mock'], '2026-09-24T09:00:00Z');

  const ps = posts(root);
  const reports = ps.filter((p) => p.kind === 'report');
  assert.equal(reports.length, 10);
  assert.ok(reports.some((p) => p.report.accepted), 'some candidate accepted');
  assert.ok(ps.some((p) => p.kind === 'digest'), 'daily digest written');
  assert.ok(ps.some((p) => (p.comments || []).some((c) => c.kind === 'trackback')), 'trackbacks written');
  assert.ok(ps.some((p) => (p.comments || []).some((c) => c.kind !== 'trackback')), 'residents commented');
  for (const p of reports) {
    const r = p.report;
    if (r.accepted) assert.ok(r.metric.after <= r.metric.before * 0.998 + 1e-4);
    if (r.metric.after != null) assert.ok(Math.abs(r.delta_pct - (r.metric.after / r.metric.before - 1) * 100) < 0.05);
  }
  const ev = events(root);
  for (const tick of ['genesis', 'evolve', 'reply']) assert.ok(ev.some((e) => e.tick === tick));
  assert.ok(fs.existsSync(path.join(root, '.agora/commit-msg.txt')));
  assert.ok(fs.existsSync(path.join(root, '.agora/summary.md')));

  const forum = J(root, 'site/forum.json');
  for (const k of ['generated', 'site', 'members', 'tasks', 'posts', 'events', 'group']) assert.ok(k in forum, k);
  assert.equal(forum.posts[0].id, Math.max(...ps.map((p) => p.id)));
  assert.equal(forum.site.brain.mode, 'mock');
  assert.ok(forum.members.cartographer.state.gen === 2 && forum.members.cartographer.soul.length > 100);
  assert.equal(forum.members.ouroboros.state, null);
  assert.deepEqual(Object.keys(forum.tasks).sort(), ['binpack', 'coloring', 'knapsack', 'tsp']);
  assert.equal(forum.group.series.packer[0].holdout, 1);
  assert.ok(forum.group.mean.length >= 2);
  assert.ok(forum.group.leaderboard.length === 5);

  run(root, 'selfcheck.mjs', []);
  fs.rmSync(root, { recursive: true, force: true });
});

test('bad brain output never crashes apply and never partially writes', { timeout: 300e3 }, () => {
  const root = mkroot();
  run(root, 'genesis.mjs', [], '2026-09-24T00:00:00Z');
  const before = posts(root).length;

  // evolve: one ok:false, one invalid schema, one broken code, one missing score, one real no-op
  run(root, 'plan.mjs', ['evolve'], '2026-09-24T01:00:00Z');
  const plan = J(root, '.agora/tasks.json');
  const id = (a) => plan.tasks.find((t) => t.agent === a).id;
  const good = (code, extra = {}) => ({ idea: '测试', title: '测试', body: '测试正文', inspired_by: [999, 1, 2], code, ...extra });
  W(root, '.agora/responses.json', { mode: 'mock', model: 'm', responses: [
    { id: id('packer'), ok: false, output: null, error: 'rate limited' },
    { id: id('cartographer'), ok: true, output: { idea: 5, title: 't' } },
    { id: id('drifter'), ok: true, output: good('function solve( {') },
    { id: id('colorist'), ok: true, output: good(plan.tasks.find((t) => t.agent === 'colorist').ctx.source, { notes: 'x'.repeat(1400) }) },
    'garbage',
  ] });
  run(root, 'apply.mjs', ['--extract']);
  const cands = J(root, '.agora/candidates.json');
  assert.deepEqual(cands.map((c) => c.key).sort(), [id('colorist'), id('drifter')].sort());
  run(root, 'evaluate.mjs', ['--batch', path.join(root, '.agora/candidates.json'), '--out', path.join(root, '.agora/scores.json')]);
  run(root, 'apply.mjs', ['evolve']);

  const ps = posts(root);
  assert.equal(ps.length, before + 2, 'only drifter + colorist produced reports');
  const dr = ps.find((p) => p.author === 'drifter' && p.kind === 'report');
  assert.equal(dr.report.accepted, false);
  assert.equal(dr.report.metric.after, null);
  assert.equal(dr.report.delta_pct, null);
  assert.ok(dr.report.error);
  assert.deepEqual(dr.report.inspired_by, [1, 2], 'unknown id dropped, own-post filter applied');
  const co = ps.find((p) => p.author === 'colorist' && p.kind === 'report');
  assert.equal(co.report.accepted, false, 'no-op rejected by ratchet');
  assert.match(co.report.error, /ratchet/);
  assert.equal(J(root, 'residents/colorist/state.json').champion.gen, 0);
  assert.equal(J(root, 'residents/packer/state.json').gen, 0, 'failed brain call does not burn a generation');
  assert.equal(J(root, 'residents/drifter/state.json').gen, 1);
  assert.equal(fs.readFileSync(path.join(root, 'residents/colorist/notes.md'), 'utf8').length, 1400);
  // trackbacks on #1 (packer) and #2 (cartographer), not on drifter's own #3
  assert.equal(J(root, 'data/posts/000001.json').comments[0].kind, 'trackback');
  const ev = events(root).filter((e) => e.tick === 'evolve');
  assert.ok(ev.some((e) => e.type === 'error' && e.actor === 'packer'));
  assert.ok(ev.some((e) => e.type === 'skip' && e.actor === 'cartographer'));
  assert.ok(ev.some((e) => e.actor === 'hoarder' && e.type === 'error'), 'missing response logged');
  assert.equal(J(root, 'data/meta.json').brain.last_error.includes('rate limited'), true);

  // reply: guards
  run(root, 'plan.mjs', ['reply'], '2026-09-24T02:00:00Z');
  const rplan = J(root, '.agora/tasks.json');
  const rt = rplan.tasks.filter((t) => t.kind === 'reply');
  assert.ok(rt.length >= 1 && rt.length <= 2);
  const agent = rt[0].agent;
  const own = ps.find((p) => p.author === agent)?.id ?? 1;
  W(root, '.agora/responses.json', { mode: 'mock', model: 'm', responses: [
    { id: rt[0].id, ok: true, output: { comments: [
      { post: 9999, reply_to: null, kind: 'note', body: '这个帖子不存在所以应该被丢弃' },
      { post: own, reply_to: 77, kind: 'answer', body: '回复一个不存在的评论也应该被丢弃' },
    ] } },
    ...(rt[1] ? [{ id: rt[1].id, ok: true, output: { comments: [] } }] : []),
    ...rplan.tasks.filter((t) => t.kind === 'digest').map((t) => ({ id: t.id, ok: true, output: { title: '日报', body: '今天很平静。' } })),
  ] });
  const beforeComments = posts(root).reduce((s, p) => s + p.comments.length, 0);
  run(root, 'apply.mjs', ['reply']);
  const afterComments = posts(root).reduce((s, p) => s + p.comments.length, 0);
  assert.equal(afterComments, beforeComments);
  const rev = events(root).filter((e) => e.tick === 'reply');
  assert.equal(rev.filter((e) => e.type === 'skip').length, 2);
  if (rt[1]) assert.ok(rev.some((e) => e.type === 'silence'));
  assert.equal(J(root, `residents/${agent}/state.json`).cursor, '2026-09-24T02:00:00Z');
  const dg = posts(root).find((p) => p.kind === 'digest');
  if (dg) assert.match(dg.body, /引擎统计/);

  // a tick with a mismatched / empty plan still leaves a record
  W(root, '.agora/tasks.json', { tick: 'reply', created: '2026-09-24T03:00:00Z', tasks: [] });
  W(root, '.agora/responses.json', { responses: [] });
  const n = events(root).length;
  run(root, 'apply.mjs', ['reply']);
  assert.equal(events(root).length, n + 1);
  assert.equal(events(root).at(-1).type, 'heartbeat');

  run(root, 'selfcheck.mjs', []);
  fs.rmSync(root, { recursive: true, force: true });
});

test('selfcheck catches a tampered champion score', { timeout: 300e3 }, () => {
  const root = mkroot();
  run(root, 'genesis.mjs', [], '2026-09-24T00:00:00Z');
  const p = path.join(root, 'residents/hoarder/state.json');
  const st = JSON.parse(fs.readFileSync(p, 'utf8'));
  st.champion.holdout = 0.5;
  fs.writeFileSync(p, JSON.stringify(st));
  const r = spawnSync(process.execPath, [path.join(REPO, 'engine/selfcheck.mjs')], { env: { ...process.env, AGORA_ROOT: root }, encoding: 'utf8' });
  assert.equal(r.status, 1);
  assert.match(r.stderr, /hoarder: champion holdout/);
  fs.rmSync(root, { recursive: true, force: true });
});
