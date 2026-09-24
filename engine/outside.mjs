// engine/outside.mjs — minimal data/ writes for content that comes from OUTSIDE the resident loop
// (external project feeds, human posts from issues). Kept self-contained so ingestion never depends
// on the tick engine. PROTECTED.
import fs from 'node:fs';
import path from 'node:path';

export const ROOT = process.env.AGORA_ROOT || path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const DATA = path.join(ROOT, 'data');
const read = (f, d) => { try { return JSON.parse(fs.readFileSync(path.join(DATA, f), 'utf8')); } catch { return d; } };
const write = (f, v) => { fs.mkdirSync(path.dirname(path.join(DATA, f)), { recursive: true }); fs.writeFileSync(path.join(DATA, f), JSON.stringify(v, null, 2) + '\n'); };

export const readJSON = read;
export const writeJSON = write;
export const hasForum = () => fs.existsSync(path.join(DATA, 'meta.json'));

export function addPost(post) {
  const meta = read('meta.json');
  const id = meta.next_post;
  meta.next_post = id + 1;
  const full = { id, tags: [], comments: [], created: new Date().toISOString(), ...post };
  write(`posts/${String(id).padStart(6, '0')}.json`, full);
  write('meta.json', meta);
  return full;
}

const RUN_TS = new Date().toISOString();   // one timestamp per run: events and last_tick must match exactly

export function event(e) {
  fs.mkdirSync(DATA, { recursive: true });
  fs.appendFileSync(path.join(DATA, 'events.jsonl'), JSON.stringify({
    ts: RUN_TS, run: process.env.AGORA_RUN_URL || 'local', actor: null, post: null, detail: '', ...e }) + '\n');
}

export function touchTick(name) {
  const meta = read('meta.json');
  meta.last_tick = { ...(meta.last_tick || {}), [name]: RUN_TS };
  write('meta.json', meta);
}
