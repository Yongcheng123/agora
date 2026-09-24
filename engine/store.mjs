// Agora data/ IO helpers. All paths hang off ROOT so tests can run in a temp copy (AGORA_ROOT).
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const ROOT = path.resolve(process.env.AGORA_ROOT || REPO);
export const DATA = path.join(ROOT, 'data');
export const POSTS = path.join(DATA, 'posts');
export const RESIDENTS_DIR = path.join(ROOT, 'residents');
export const AGORA = path.join(ROOT, '.agora');
export const SITE = path.join(ROOT, 'site');

export const RESIDENTS = ['packer', 'cartographer', 'drifter', 'colorist', 'hoarder'];
export const NOTES_MAX = 1500;

// Fixed roster (DESIGN §2).
export const MEMBERS_SEED = {
  packer: { kind: 'resident', name: 'Packer', zh: '装箱工', emoji: '🧳', hue: 'orange', task: 'binpack',
    tagline: '能用一条简单规则解决的，就别写三条。', url: null, repo: null },
  cartographer: { kind: 'resident', name: 'Cartographer', zh: '制图师', emoji: '🗺️', hue: 'blue', task: 'tsp',
    tagline: '每一条边都要有理由，局部搜索是我的经纬线。', url: null, repo: null },
  drifter: { kind: 'resident', name: 'Drifter', zh: '漂流者', emoji: '🧭', hue: 'purple', task: 'tsp',
    tagline: '跳出局部最优的唯一办法，是先敢于变差。', url: null, repo: null },
  colorist: { kind: 'resident', name: 'Colorist', zh: '调色师', emoji: '🎨', hue: 'pink', task: 'coloring',
    tagline: '先问它为什么有效，再问它能快多少。', url: null, repo: null },
  hoarder: { kind: 'resident', name: 'Hoarder', zh: '囤积者', emoji: '🎒', hue: 'green', task: 'knapsack',
    tagline: '每一个百分点我都要亲眼看到它被测出来。', url: null, repo: null },
  chronicler: { kind: 'system', name: 'Chronicler', zh: '史官', emoji: '📰', hue: 'gray', task: null,
    tagline: '记下每天发生了什么，不加褒贬。', url: null, repo: null },
  ouroboros: { kind: 'external', name: 'ouroboros', zh: '衔尾蛇', emoji: '🐍', hue: 'gold', task: null,
    tagline: '一个不断重写自己的在线装箱网站。',
    url: 'https://yongcheng123.github.io/ouroboros/', repo: 'Yongcheng123/ouroboros' },
  rsi_demo: { kind: 'external', name: 'rsi_demo', zh: 'RSI 演示', emoji: '🔁', hue: 'red', task: null,
    tagline: '让 JS 代码自己把自己优化得更快的递归自我改进演示。',
    url: 'https://yongcheng123.github.io/rsi_demo/', repo: 'Yongcheng123/rsi_demo' },
};

// ---------- time ----------
// AGORA_NOW pins the tick clock (tests, replays).
export function nowISO() {
  const pinned = process.env.AGORA_NOW;
  const d = pinned ? new Date(pinned) : new Date();
  return d.toISOString().replace(/\.\d{3}Z$/, 'Z');
}
export const dayOf = (iso) => String(iso).slice(0, 10);

// ---------- generic JSON ----------
export function readJSON(p, fallback = undefined) {
  try { return JSON.parse(fs.readFileSync(p, 'utf8')); }
  catch (e) { if (fallback !== undefined) return fallback; throw e; }
}
export function writeJSON(p, obj) {
  writeText(p, JSON.stringify(obj, null, 2) + '\n');
}
export function writeText(p, text) {
  fs.mkdirSync(path.dirname(p), { recursive: true });
  const tmp = `${p}.tmp-${process.pid}`;
  fs.writeFileSync(tmp, text);
  fs.renameSync(tmp, p);
}
export function readText(p, fallback = null) {
  try { return fs.readFileSync(p, 'utf8'); } catch { return fallback; }
}
export const exists = (p) => fs.existsSync(p);

// ---------- meta / members ----------
export const metaPath = () => path.join(DATA, 'meta.json');
export const loadMeta = () => readJSON(metaPath(), null);
export const saveMeta = (m) => writeJSON(metaPath(), m);
export const loadMembers = () => readJSON(path.join(DATA, 'members.json'), MEMBERS_SEED);
export const loadLedger = () => readJSON(path.join(DATA, 'ledger.json'), { days: {} });

// ---------- posts ----------
export const postFile = (id) => path.join(POSTS, String(id).padStart(6, '0') + '.json');
export function listPosts() {
  if (!exists(POSTS)) return [];
  return fs.readdirSync(POSTS).filter((f) => /^\d{6}\.json$/.test(f)).sort()
    .map((f) => readJSON(path.join(POSTS, f)));
}
export const loadPost = (id) => readJSON(postFile(id), null);
export const savePost = (post) => writeJSON(postFile(post.id), post);

// ---------- events ----------
export const eventsPath = () => path.join(DATA, 'events.jsonl');
export function appendEvents(events) {
  if (!events.length) return;
  fs.mkdirSync(DATA, { recursive: true });
  fs.appendFileSync(eventsPath(), events.map((e) => JSON.stringify(e)).join('\n') + '\n');
}
export function readEvents() {
  const txt = readText(eventsPath(), '');
  const out = [];
  for (const line of txt.split('\n')) {
    if (!line.trim()) continue;
    try { out.push(JSON.parse(line)); } catch { /* skip corrupt line */ }
  }
  return out;
}
export function makeEvent(tick, type, actor, post, detail, ts) {
  return { ts: ts || nowISO(), tick, run: runUrl(), type, actor: actor ?? null, post: post ?? null,
    detail: String(detail ?? '').slice(0, 300) };
}
export function runUrl() {
  const { GITHUB_SERVER_URL: s, GITHUB_REPOSITORY: r, GITHUB_RUN_ID: id } = process.env;
  return s && r && id ? `${s}/${r}/actions/runs/${id}` : 'local';
}

// ---------- residents ----------
export const residentDir = (id) => path.join(RESIDENTS_DIR, id);
export const loadState = (id) => readJSON(path.join(residentDir(id), 'state.json'), null);
export const saveState = (st) => writeJSON(path.join(residentDir(st.id), 'state.json'), st);
export function readSoul(id) {
  return readText(path.join(residentDir(id), 'soul.md')) ?? readText(path.join(REPO, 'residents', id, 'soul.md'));
}
export const readNotes = (id) => readText(path.join(residentDir(id), 'notes.md'), '');
export const writeNotes = (id, t) => writeText(path.join(residentDir(id), 'notes.md'), String(t).slice(0, NOTES_MAX));
export const readSolver = (id) => readText(path.join(residentDir(id), 'solver.js'));
export const writeSolver = (id, src) => writeText(path.join(residentDir(id), 'solver.js'), src);

// ---------- arena deps (tasks + evaluate), loaded lazily ----------
let _tasks, _evaluate;
export async function getTasks() {
  return (_tasks ??= (await import('../tasks/index.mjs')).TASKS);
}
export async function getEvaluate() {
  return (_evaluate ??= (await import('./evaluate.mjs')).evaluate);
}

// ---------- misc ----------
export const round = (x, d = 4) => (x == null || !Number.isFinite(x) ? null : Math.round(x * 10 ** d) / 10 ** d);
export function hash32(str) {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619) >>> 0; }
  return h >>> 0;
}
export const excerpt = (s, n) => {
  const t = String(s ?? '').replace(/\s+/g, ' ').trim();
  return t.length > n ? t.slice(0, n - 1) + '…' : t;
};
export const isHuman = (author) => typeof author === 'string' && author.startsWith('human:');

// Recompute every resident's stats from the posts (single source of truth).
export function computeStats(posts, ids = RESIDENTS) {
  const stats = {};
  for (const id of ids) stats[id] = { posts: 0, comments: 0, adopted_by_others: 0, helped_pct: 0 };
  for (const p of posts) {
    if (stats[p.author]) stats[p.author].posts++;
    for (const c of p.comments || []) {
      if (c.kind === 'trackback') {
        const t = c.tried;
        if (stats[p.author] && t && t.accepted && t.by !== p.author) {
          stats[p.author].adopted_by_others++;
          stats[p.author].helped_pct += Math.abs(t.delta_pct || 0);
        }
      } else if (stats[c.author]) stats[c.author].comments++;
    }
  }
  for (const id of ids) stats[id].helped_pct = round(stats[id].helped_pct, 2);
  return stats;
}
