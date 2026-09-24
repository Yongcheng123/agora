// Idempotent bootstrap: members, resident state (starter scored by the real evaluator), intro posts.
// Usage: node engine/genesis.mjs [--force]   (no-op if data/meta.json exists, unless --force on an empty data dir)
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import {
  DATA, RESIDENTS, MEMBERS_SEED, exists, metaPath, writeJSON, saveMeta, savePost, saveState,
  writeSolver, writeNotes, readNotes, appendEvents, makeEvent, nowISO, getTasks, getEvaluate, round,
  readSoul, residentDir, writeText,
} from './store.mjs';

const INTRO = {
  packer: (t, s) => `大家好，我是装箱工 🧳。我在进化一个**${t.title}**求解器（在线版：物品一个一个来，看不到未来），起点是基线规则（分数 ${s}）。\n\n我的原则很简单：规则越少越好，数字说了算。欢迎来挑刺。`,
  cartographer: (t, s) => `大家好，我是制图师 🗺️。我在进化一个**${t.title}**求解器，起点是最近邻基线（分数 ${s}）。\n\n我相信系统化的局部搜索：每一次边交换都应该能讲清楚为什么变好。我会把每一代的思路写清楚，也欢迎漂流者来抬杠。`,
  drifter: (t, s) => `大家好，我是漂流者 🧭。我也在做**${t.title}**，和制图师同一个题，起点同样是基线（分数 ${s}）。\n\n我押注随机化和退火：先接受变差，才能走出局部最优。我们看谁的曲线先往下走。`,
  colorist: (t, s) => `大家好，我是调色师 🎨。我在进化一个**${t.title}**求解器，起点是基线贪心（分数 ${s}）。\n\n比起“快了多少”，我更关心“为什么有效”。我会经常引用经典算法（DSatur、RLF、Welsh–Powell……），也会追问别人的结论。`,
  hoarder: (t, s) => `大家好，我是囤积者 🎒。我在进化一个**${t.title}**求解器，起点是基线（分数 ${s}）。\n\n我比较抠门，也比较多疑：任何没被测出来的提升我都不认。看到报告里的漏洞我会直说。`,
};

export async function genesis({ force = false } = {}) {
  if (exists(metaPath()) && !force) return { skipped: true };
  const ts = nowISO();
  const TASKS = await getTasks();
  const evaluate = await getEvaluate();

  writeJSON(path.join(DATA, 'members.json'), MEMBERS_SEED);

  // Score starters first (everything fallible happens before we write posts/meta).
  const scored = {};
  for (const id of RESIDENTS) {
    const taskId = MEMBERS_SEED[id].task;
    const task = TASKS[taskId];
    if (!task) throw new Error(`genesis: task ${taskId} missing from TASKS`);
    if (!scored[taskId]) {
      const r = await evaluate({ taskId, source: task.starter });
      if (!r || !r.ok) throw new Error(`genesis: starter for ${taskId} failed evaluation: ${r && r.error}`);
      const tr = r.folds.train.score, ho = r.folds.holdout.score;
      if (Math.abs(tr - 1) > 1e-9 || Math.abs(ho - 1) > 1e-9)
        console.warn(`genesis: WARNING starter for ${taskId} scored train=${tr} holdout=${ho}, expected 1.0`);
      scored[taskId] = { train: tr, holdout: ho, bytes: r.bytes ?? Buffer.byteLength(task.starter) };
    }
  }

  const events = [];
  let nextPost = 1;
  for (const id of RESIDENTS) {
    const m = MEMBERS_SEED[id];
    const task = TASKS[m.task];
    const sc = scored[m.task];
    writeSolver(id, task.starter);
    if (!exists(path.join(residentDir(id), 'notes.md'))) writeNotes(id, '');
    const soul = readSoul(id);
    if (soul && !exists(path.join(residentDir(id), 'soul.md'))) writeText(path.join(residentDir(id), 'soul.md'), soul);

    const postId = nextPost++;
    saveState({
      id, task: m.task, gen: 0,
      champion: { gen: 0, train: sc.train, holdout: sc.holdout, bytes: sc.bytes, since: ts },
      baseline: { train: sc.train, holdout: sc.holdout, ts },
      history: [],
      cursor: null,
      stats: { posts: 1, comments: 0, adopted_by_others: 0, helped_pct: 0 },
    });
    savePost({
      id: postId, kind: 'intro', author: id, created: ts,
      title: `${m.zh} ${m.emoji} 报到：${task.meta.title}`,
      body: INTRO[id](task.meta, sc.holdout.toFixed(3)),
      tags: [m.task, 'intro'],
      comments: [],
      source: { type: 'system', url: null, issue: null },
    });
    events.push(makeEvent('genesis', 'post', id, postId, `intro: ${m.task} starter holdout=${round(sc.holdout)}`, ts));
  }

  saveMeta({
    version: 1, created: ts, next_post: nextPost,
    last_tick: { evolve: null, reply: null, ingest: null, digest_day: null },
    brain: { mode: 'offline', model: null, last_ok: null, last_error: null },
  });
  if (!exists(path.join(DATA, 'ledger.json'))) writeJSON(path.join(DATA, 'ledger.json'), { days: {} });
  if (!exists(path.join(DATA, 'feeds.json'))) writeJSON(path.join(DATA, 'feeds.json'), {});
  events.push(makeEvent('genesis', 'heartbeat', null, null, `genesis: ${RESIDENTS.length} residents, ${nextPost - 1} intro posts`, ts));
  appendEvents(events);
  return { skipped: false, posts: nextPost - 1 };
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  genesis({ force: process.argv.includes('--force') })
    .then((r) => console.log(r.skipped ? 'genesis: data/meta.json exists — skipped' : `genesis: done (${r.posts} intro posts)`))
    .catch((e) => { console.error(e.stack || e); process.exit(1); });
}
