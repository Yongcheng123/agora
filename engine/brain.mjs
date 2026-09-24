// engine/brain.mjs — turns .agora/tasks.json into .agora/responses.json. PROTECTED.
//
//   node engine/brain.mjs --tasks .agora/tasks.json --out .agora/responses.json
//
// Mode is picked from the environment (override with AGORA_BRAIN):
//   claude-code  CLAUDE_CODE_OAUTH_TOKEN is set → headless `claude -p --json-schema`, no tools
//   api          ANTHROPIC_API_KEY is set       → Messages API, schema forced through a tool
//   mock         deterministic fake (engine/mock-brain.mjs), for tests
//   offline      nothing configured → every response is ok:false, the tick still leaves a record
// The brain only ever returns JSON. It has no tools, and nothing it says is executed here.
import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';

const ROOT = process.env.AGORA_ROOT || path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const args = Object.fromEntries(process.argv.slice(2).reduce((a, v, i, all) =>
  v.startsWith('--') ? [...a, [v.slice(2), all[i + 1]?.startsWith('--') ? true : all[i + 1] ?? true]] : a, []));
const TASKS = path.resolve(args.tasks || path.join(ROOT, '.agora/tasks.json'));
const OUT = path.resolve(args.out || path.join(ROOT, '.agora/responses.json'));

const MODELS = {
  evolve: process.env.AGORA_MODEL_EVOLVE || 'claude-opus-5-5',
  reply: process.env.AGORA_MODEL_REPLY || 'claude-sonnet-5',
  digest: process.env.AGORA_MODEL_REPLY || 'claude-sonnet-5',
};
const MAX_CALLS = Number(process.env.MAX_CALLS_PER_DAY || 80);
const MAX_USD = Number(process.env.MAX_USD_PER_DAY || 5);
const TIMEOUT_MS = Number(process.env.AGORA_BRAIN_TIMEOUT_MS || 900000);

function pickMode() {
  if (process.env.AGORA_BRAIN) return process.env.AGORA_BRAIN;
  if (process.env.OPENAI_API_KEY && process.env.OPENAI_BASE_URL) return 'openai';
  if (process.env.CLAUDE_CODE_OAUTH_TOKEN) return 'claude-code';
  if (process.env.ANTHROPIC_API_KEY) return 'api';
  return 'offline';
}

// ---- ledger: the daily budget lives in the repo so every run sees the same total ----
const LEDGER = path.join(ROOT, 'data/ledger.json');
const today = () => new Date().toISOString().slice(0, 10);
function loadLedger() { try { return JSON.parse(fs.readFileSync(LEDGER, 'utf8')); } catch { return { days: {} }; } }
function saveLedger(l) {
  fs.mkdirSync(path.dirname(LEDGER), { recursive: true });
  const keep = Object.keys(l.days).sort().slice(-60);           // 60 days is plenty of history
  l.days = Object.fromEntries(keep.map(k => [k, l.days[k]]));
  fs.writeFileSync(LEDGER, JSON.stringify(l, null, 2) + '\n');
}

// ---- claude-code: official headless CLI, authenticated by the subscription token ----
function runClaude(task, model) {
  const argv = ['-p', '--output-format', 'json', '--model', model, '--max-turns', '4',
    '--tools', '', '--strict-mcp-config', '--mcp-config', '{"mcpServers":{}}',
    '--setting-sources', '', '--disable-slash-commands',
    '--system-prompt', task.system, '--json-schema', JSON.stringify(task.schema)];
  const env = { ...process.env };
  delete env.CLAUDECODE; delete env.CLAUDE_CODE_ENTRYPOINT;       // allow nesting when run from a session
  return new Promise((resolve) => {
    const child = spawn(process.env.AGORA_CLAUDE_BIN || 'claude', argv, { env, stdio: ['pipe', 'pipe', 'pipe'] });
    let out = '', err = '';
    const timer = setTimeout(() => { child.kill('SIGKILL'); err += 'timeout'; }, TIMEOUT_MS);
    child.stdout.on('data', d => out += d); child.stderr.on('data', d => err += d);
    child.on('error', e => { clearTimeout(timer); resolve({ ok: false, error: `spawn: ${e.message}` }); });
    child.on('close', () => {
      clearTimeout(timer);
      try {
        const j = JSON.parse(out);
        const u = j.usage || {};
        const usage = { input_tokens: (u.input_tokens || 0) + (u.cache_read_input_tokens || 0) + (u.cache_creation_input_tokens || 0),
          output_tokens: u.output_tokens || 0, usd: j.total_cost_usd || 0 };
        if (j.is_error || !j.structured_output) return resolve({ ok: false, usage, error: String(j.result || j.subtype || 'no structured_output').slice(0, 300) });
        resolve({ ok: true, output: j.structured_output, usage });
      } catch { resolve({ ok: false, error: `bad cli output: ${(err || out).slice(0, 300)}` }); }
    });
    child.stdin.end(task.prompt);
  });
}

// ---- api: plain Messages API; a single forced tool carries the schema ----
const PRICE = { 'claude-opus-5-5': [5, 25], 'claude-sonnet-5': [3, 15] };   // USD per MTok in/out, budget estimate only
async function runApi(task, model) {
  const ctl = new AbortController();
  const timer = setTimeout(() => ctl.abort(), TIMEOUT_MS);
  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST', signal: ctl.signal,
      headers: { 'content-type': 'application/json', 'x-api-key': process.env.ANTHROPIC_API_KEY, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({
        model, max_tokens: task.max_tokens || 8000, system: task.system,
        messages: [{ role: 'user', content: task.prompt }],
        tools: [{ name: 'submit', description: 'Submit your answer.', input_schema: task.schema }],
        tool_choice: { type: 'tool', name: 'submit' },
      }),
    });
    const j = await res.json();
    if (!res.ok) return { ok: false, error: `${res.status} ${j?.error?.message || ''}`.slice(0, 300) };
    const [pin, pout] = PRICE[model] || [5, 25];
    const usage = { input_tokens: j.usage?.input_tokens || 0, output_tokens: j.usage?.output_tokens || 0 };
    usage.usd = (usage.input_tokens * pin + usage.output_tokens * pout) / 1e6;
    const call = (j.content || []).find(c => c.type === 'tool_use');
    return call ? { ok: true, output: call.input, usage } : { ok: false, usage, error: `no tool_use (${j.stop_reason})` };
  } catch (e) { return { ok: false, error: `fetch: ${e.message}` }; }
  finally { clearTimeout(timer); }
}

// ---- openai: any OpenAI-compatible gateway (e.g. a LiteLLM proxy); schema forced through a tool ----
async function runOpenAI(task, model) {
  const ctl = new AbortController();
  const timer = setTimeout(() => ctl.abort(), TIMEOUT_MS);
  try {
    const base = process.env.OPENAI_BASE_URL.replace(/\/+$/, '');
    const res = await fetch(`${base}/v1/chat/completions`, {
      method: 'POST', signal: ctl.signal,
      headers: { 'content-type': 'application/json', authorization: `Bearer ${process.env.OPENAI_API_KEY}` },
      body: JSON.stringify({
        model, max_tokens: Number(process.env.AGORA_MAX_TOKENS || 64000),   // reasoning models spend much of it thinking
        messages: [{ role: 'system', content: task.system }, { role: 'user', content: task.prompt }],
        tools: [{ type: 'function', function: { name: 'submit', description: 'Submit your answer.', parameters: task.schema } }],
        tool_choice: { type: 'function', function: { name: 'submit' } },
      }),
    });
    const j = await res.json().catch(() => ({}));
    if (!res.ok) return { ok: false, error: `${res.status} ${j?.error?.message || ''}`.slice(0, 300) };
    const usage = { input_tokens: j.usage?.prompt_tokens || 0, output_tokens: j.usage?.completion_tokens || 0, usd: 0 };
    const msg = j.choices?.[0]?.message || {};
    const call = msg.tool_calls?.[0];
    if (!call) {
      // Some models answer in prose despite tool_choice: take the last JSON object in the text.
      const text = String(msg.content || '').replace(/<think>[\s\S]*?<\/think>/g, '');
      const m = text.match(/\{[\s\S]*\}/);
      if (m) { try { return { ok: true, output: JSON.parse(m[0]), usage }; } catch {} }
      return { ok: false, usage, error: `no tool call (${j.choices?.[0]?.finish_reason})` };
    }
    try { return { ok: true, output: JSON.parse(call.function.arguments), usage }; }
    catch { return { ok: false, usage, error: 'tool arguments are not JSON' }; }
  } catch (e) { return { ok: false, error: `fetch: ${e.message}` }; }
  finally { clearTimeout(timer); }
}

async function main() {
  const plan = JSON.parse(fs.readFileSync(TASKS, 'utf8'));
  const mode = pickMode();
  fs.mkdirSync(path.dirname(OUT), { recursive: true });

  if (mode === 'mock') {
    const { mockRespond } = await import('./mock-brain.mjs');
    const responses = await mockRespond(plan);
    fs.writeFileSync(OUT, JSON.stringify({ mode, model: 'mock', responses: responses.responses || responses }, null, 2));
    return;
  }

  const ledger = loadLedger();
  const day = (ledger.days[today()] ||= { calls: 0, input_tokens: 0, output_tokens: 0, usd: 0 });
  const responses = [];
  let lastModel = null;
  // Evolve tasks are independent and slow — run a few at once. Replies stay sequential.
  const width = plan.tick === 'evolve' ? 3 : 1;
  const queue = [...plan.tasks];
  async function worker() {
    for (let t; (t = queue.shift());) {
      if (mode === 'offline') { responses.push({ id: t.id, ok: false, error: 'brain offline: no CLAUDE_CODE_OAUTH_TOKEN or ANTHROPIC_API_KEY' }); continue; }
      if (day.calls >= MAX_CALLS || day.usd >= MAX_USD) { responses.push({ id: t.id, ok: false, error: `daily budget reached (${day.calls} calls, $${day.usd.toFixed(2)})` }); continue; }
      const model = MODELS[t.kind] || MODELS.reply;
      lastModel = model;
      day.calls++;
      const r = mode === 'api' ? await runApi(t, model) : mode === 'openai' ? await runOpenAI(t, model) : await runClaude(t, model);
      if (r.usage) { day.input_tokens += r.usage.input_tokens; day.output_tokens += r.usage.output_tokens; day.usd += r.usage.usd || 0; }
      responses.push({ id: t.id, ok: r.ok, output: r.output ?? null, error: r.error ?? null, usage: r.usage ?? null });
      console.log(`${r.ok ? '✓' : '✗'} ${t.id} ${r.ok ? '' : r.error}`);
    }
  }
  await Promise.all(Array.from({ length: Math.min(width, queue.length || 1) }, worker));
  if (mode !== 'offline') saveLedger(ledger);
  fs.writeFileSync(OUT, JSON.stringify({ mode, model: lastModel, responses }, null, 2));
}

main().catch(e => { console.error(e); process.exit(1); });
