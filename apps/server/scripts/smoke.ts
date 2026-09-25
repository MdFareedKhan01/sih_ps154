// End-to-end check of the running system: login, ingest, batch, stream with a dropped socket,
// snapshot, audit chain. Needs Docker, a seeded database, `npm run dev:api` and `npm run dev:worker`.
//   npm run smoke                      uses samples/demo-incident.md
//   npm run smoke -- samples/other.md
import { readFileSync } from 'node:fs';
import WebSocket from 'ws';

const API = process.env.API_URL ?? 'http://localhost:8080';
const file = process.argv[2] ?? 'samples/demo-incident.md';
const failures: string[] = [];

function check(ok: boolean, what: string) {
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${what}`);
  if (!ok) failures.push(what);
}

async function call(path: string, token?: string, body?: object): Promise<any> {
  const res = await fetch(`${API}/api/v1${path}`, {
    method: body ? 'POST' : 'GET',
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(`${path} returned ${res.status}: ${JSON.stringify(json)}`);
  return json;
}

const login = async (name: string) => (await call('/auth/login', undefined, { name, password: 'demo1234' })).token;

/** Read frames after `since` until `until(frame)` holds, then close the socket. */
function readStream(batchId: string, token: string, since: string, until: (f: any) => boolean) {
  return new Promise<any[]>((resolve, reject) => {
    const frames: any[] = [];
    let done = false;
    const ws = new WebSocket(`${API.replace(/^http/, 'ws')}/api/v1/jobs/${batchId}/stream?since=${since}&token=${token}`);
    const timer = setTimeout(() => { ws.close(); reject(new Error('no frame for 120 s')); }, 120_000);
    ws.on('message', (data) => {
      if (done) return; // frames already in flight when we closed belong to the next connection
      const f = JSON.parse(String(data));
      frames.push(f);
      console.log(`      ${f.event.padEnd(16)}${f.status ?? f.overall_status ?? ''}`);
      if (until(f)) { done = true; clearTimeout(timer); ws.close(); resolve(frames); }
    });
    ws.on('error', (e) => { clearTimeout(timer); reject(e); });
  });
}

const operator = await login('operator');
const source = await call('/sources', operator, { text: readFileSync(file, 'utf8'), classification: 'public' });
check(source.spans.length > 0 && source.canonical !== null,
      `ingested ${file}: ${source.spans.length} spans, canonical object extracted`);

const started = Date.now();
const batch = await call('/jobs/batch', operator, {
  source_id: source.id,
  global_config: { audience: 'Senior government officials', tone: 'formal', detail: 'medium', language: 'en' },
  formats: [{ format_id: 'advisory' }, { format_id: 'executive_summary' },
            { format_id: 'linkedin_post', overrides: { tone: 'conversational' } }],
});
check(batch.tasks.length === 3 && batch.tasks.every((t: any) => t.status === 'waiting'), '202 with three waiting tasks');

// Drop the socket after the first finished card, then resume from the last seq seen (AC-13).
const first = await readStream(batch.batch_id, operator, '0',
                               (f) => f.event === 'task.completed' || f.event === 'task.failed');
console.log(`      -- socket dropped; reconnecting from ${first.at(-1).seq}`);
const rest = await readStream(batch.batch_id, operator, first.at(-1).seq, (f) => f.event === 'batch.completed');
const frames = [...first, ...rest];
const seconds = (Date.now() - started) / 1000;

const snap = await call(`/jobs/${batch.batch_id}`, operator);
const ready = snap.artifacts.filter((a: any) => a.status === 'ready').length;
check(new Set(frames.map((f) => f.seq)).size === frames.length, 'reconnect repeated no frame (AC-13)');
check(frames.filter((f) => f.event === 'task.completed').length === ready, 'reconnect lost no frame (AC-13)');
check(ready === 3 && seconds <= 60, `all three formats ready in ${seconds.toFixed(1)} s (AC-1)`);
check(snap.overall_status === frames.at(-1).overall_status, `snapshot agrees with the stream: ${snap.overall_status}`);
const tone = (id: string) => snap.artifacts.find((a: any) => a.format_id === id)?.effective_config.tone;
check(tone('linkedin_post') === 'conversational' && tone('advisory') === 'formal',
      'tone override recorded on the LinkedIn post only (AC-11)');

const chain = await call('/audit/verify', await login('admin'));
check(chain.valid === true, `audit chain valid across ${chain.rows_checked} rows (AC-14)`);

console.log(failures.length ? `\n${failures.length} check(s) failed` : '\nSmoke test passed');
process.exit(failures.length ? 1 : 0);
