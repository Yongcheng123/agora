// Local orchestrator: plan → brain → extract → evaluate → apply → build.
// Usage: node engine/tick.mjs <genesis|evolve|reply> [--brain mock]
// Honors AGORA_ROOT (data dir) and AGORA_NOW (pinned clock). Never leaves a tick without a record.
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';
import { REPO, AGORA, ROOT, exists, metaPath, writeJSON, readJSON, appendEvents, makeEvent, nowISO } from './store.mjs';
import { genesis } from './genesis.mjs';
import { plan } from './plan.mjs';
import { extract, apply } from './apply.mjs';
import { build } from './build.mjs';
import { mockRespond } from './mock-brain.mjs';

const node = (script, args, env = {}) => spawnSync(process.execPath, [path.join(REPO, 'engine', script), ...args], {
  stdio: 'inherit', env: { ...process.env, AGORA_ROOT: ROOT, ...env }, cwd: ROOT, timeout: 30 * 60e3,
});

export async function tick(kind, { brain = null } = {}) {
  if (!['genesis', 'evolve', 'reply'].includes(kind)) throw new Error('usage: tick.mjs <genesis|evolve|reply> [--brain mock]');
  fs.mkdirSync(AGORA, { recursive: true });
  if (!exists(metaPath())) { const g = await genesis(); console.log(`genesis: ${g.skipped ? 'skipped' : `${g.posts} intro posts`}`); }
  else if (kind === 'genesis') console.log('genesis: already done');
  if (kind === 'genesis') { await build(); return; }

  const tasksPath = path.join(AGORA, 'tasks.json');
  const respPath = path.join(AGORA, 'responses.json');
  const scoresPath = path.join(AGORA, 'scores.json');
  const candPath = path.join(AGORA, 'candidates.json');
  for (const p of [respPath, scoresPath, candPath]) fs.rmSync(p, { force: true });

  const p = await plan(kind);
  console.log(`plan(${kind}): ${p.tasks.length} task(s)`);

  // brain
  if (p.tasks.length) {
    const useMock = brain === 'mock' || process.env.AGORA_BRAIN === 'mock';
    const brainJs = path.join(REPO, 'engine', 'brain.mjs');
    if (exists(brainJs)) {
      const r = node('brain.mjs', ['--tasks', tasksPath, '--out', respPath], useMock ? { AGORA_BRAIN: 'mock' } : {});
      if (r.status !== 0) console.warn(`brain.mjs exited with ${r.status ?? r.signal}`);
    } else {
      if (!useMock) console.warn('engine/brain.mjs missing — falling back to mock brain');
      writeJSON(respPath, { mode: 'mock', model: 'mock', responses: await mockRespond(p) });
    }
    if (!exists(respPath)) {
      writeJSON(respPath, { mode: null, model: null, error: 'brain produced no responses.json',
        responses: p.tasks.map((t) => ({ id: t.id, ok: false, output: null, error: 'brain produced no output', usage: null })) });
    }
  } else writeJSON(respPath, { mode: null, model: null, responses: [] });

  // evaluate candidates (evolve)
  if (kind === 'evolve') {
    const cands = extract();
    console.log(`extract: ${cands.length} candidate(s)`);
    if (cands.length) {
      const r = node('evaluate.mjs', ['--batch', candPath, '--out', scoresPath]);
      if (r.status !== 0 || !exists(scoresPath)) {
        console.warn('evaluate --batch failed; every candidate will be recorded as unevaluated');
        writeJSON(scoresPath, Object.fromEntries(cands.map((c) => [c.key, { task: c.task, ok: false, error: 'batch evaluation failed', folds: null }])));
      }
    } else writeJSON(scoresPath, {});
  }

  try {
    const r = await apply(kind);
    console.log(r.commit.trim());
  } catch (e) {
    appendEvents([makeEvent(kind, 'error', null, null, `apply crashed: ${String(e.message).slice(0, 200)}`, readJSON(tasksPath, {}).created || nowISO())]);
    throw e;
  }
  await build();
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const i = process.argv.indexOf('--brain');
  tick(process.argv[2], { brain: i > 0 ? process.argv[i + 1] : null })
    .catch((e) => { console.error(e.stack || e); process.exit(1); });
}
