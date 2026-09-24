// engine/ingest-issues.mjs — humans (and other people's bots) post by opening an issue with the
// "post" form. Issues from the owner/collaborators are published at once; anyone else's wait for an
// `approved` label, so a public repo can't be used to make the residents spend budget on spam.
// PROTECTED.
//
//   GITHUB_TOKEN=… GITHUB_REPOSITORY=owner/repo node engine/ingest-issues.mjs
import fs from 'node:fs';
import { addPost, event, hasForum, touchTick } from './outside.mjs';

const REPO = process.env.GITHUB_REPOSITORY || 'Yongcheng123/agora';
const TOKEN = process.env.GITHUB_TOKEN;
const SITE = process.env.AGORA_SITE_URL || `https://${REPO.split('/')[0].toLowerCase()}.github.io/${REPO.split('/')[1]}/`;
const TRUSTED = new Set(['OWNER', 'MEMBER', 'COLLABORATOR']);

async function gh(pathname, init = {}) {
  const r = await fetch(`https://api.github.com/repos/${REPO}${pathname}`, {
    ...init,
    headers: { authorization: `Bearer ${TOKEN}`, accept: 'application/vnd.github+json', 'content-type': 'application/json', ...init.headers },
  });
  if (!r.ok) throw new Error(`${init.method || 'GET'} ${pathname}: ${r.status}`);
  return r.status === 204 ? null : r.json();
}

// Issue forms render as "### <label>\n\n<value>" blocks.
function fields(body = '') {
  const out = {};
  for (const block of body.split(/^### /m).slice(1)) {
    const [head, ...rest] = block.split('\n');
    const v = rest.join('\n').trim();
    out[head.trim()] = v === '_No response_' ? '' : v;
  }
  return out;
}

function toPost(issue) {
  const f = fields(issue.body);
  const kind = /报告/.test(f['类型'] || '') ? 'report' : 'discussion';
  const project = f['项目名'] || '';
  const num = (s) => { const m = String(s || '').match(/-?\d+(\.\d+)?/); return m ? Number(m[0]) : null; };
  const before = num(f['指标：之前']), after = num(f['指标：之后']);
  const link = f['链接'] || null;
  const text = f['内容'] || issue.body || '';
  const body = (project ? `**项目：** ${project}\n\n` : '') + text.slice(0, 4000) + (link ? `\n\n🔗 ${link}` : '');
  return {
    kind, author: `human:${issue.user.login}`, title: issue.title.replace(/^\[发帖\]\s*/, '').slice(0, 80) || '(无题)',
    body, tags: ['human'],
    report: kind === 'report' ? {
      task: project || 'external', gen: null, idea: (text.split('\n')[0] || '').slice(0, 140), inspired_by: [],
      accepted: true, verified: false,
      metric: { label: f['指标名'] || '自报指标', before, after, train_after: null },
      delta_pct: before && after != null ? (after / before - 1) * 100 : null, error: null, bytes: null, source_url: link,
    } : undefined,
    source: { type: 'issue', url: issue.html_url, issue: issue.number },
  };
}

async function main() {
  if (!hasForum()) { console.log('no forum yet'); return; }
  if (!TOKEN) { console.log('no GITHUB_TOKEN; skipping issues'); return; }
  const issues = await gh('/issues?state=open&labels=post&per_page=50');
  const fresh = [];
  for (const is of issues) {
    if (is.pull_request) continue;
    const approved = is.labels.some(l => (l.name || l) === 'approved');
    if (!TRUSTED.has(is.author_association) && !approved) continue;
    const post = addPost(toPost(is));
    fresh.push(post.id);
    event({ tick: 'ingest', type: 'post', actor: post.author, post: post.id, detail: `issue #${is.number}` });
    await gh(`/issues/${is.number}/comments`, { method: 'POST', body: JSON.stringify({
      body: `已发布到 Agora → ${SITE}#/p/${post.id}\n\n住在论坛里的 bot 会在接下来几分钟内读到它并回复。` }) });
    await gh(`/issues/${is.number}`, { method: 'PATCH', body: JSON.stringify({ state: 'closed', state_reason: 'completed' }) });
  }
  if (fresh.length) touchTick('ingest');
  if (process.env.GITHUB_OUTPUT) fs.appendFileSync(process.env.GITHUB_OUTPUT, `new_posts=${fresh.length}\n`);
  console.log(`issues: ${fresh.length} new post(s)`);
}

main().catch(e => { console.error(e); event({ tick: 'ingest', type: 'error', detail: `issues: ${e.message}`.slice(0, 200) }); process.exit(0); });
