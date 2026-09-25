// Rebuilds docs/final/*.html from the Markdown beside them, so the two never drift. Needs pandoc 3 on PATH.
//   npm run docs:html                                    every document
//   npm run docs:html -- SIH26154-Guide-B-Backend.md     just one
import { execFileSync } from 'node:child_process';
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { basename, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const dir = join(here, '..', 'final');
const header = join(here, 'guide-header.html');
const args = process.argv.slice(2).map((f) => basename(f));
const files = args.length ? args : readdirSync(dir).filter((f) => f.endsWith('.md'));

for (const file of files) {
  const md = join(dir, file);
  const title = readFileSync(md, 'utf8').split('\n', 1)[0].replace(/^# /, '').trim();
  const html = execFileSync('pandoc', [
    '-f', 'gfm', '-t', 'html5', '-s', '--eol=lf', '--toc', '--toc-depth=2',
    '--metadata', `pagetitle=${title}`, '-H', header, md,
  ], { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
  // Drop the <code> wrapper pandoc puts inside mermaid blocks, so mermaid.js can draw them.
  const out = html.replace(/<pre class="mermaid"><code>([\s\S]*?)<\/code><\/pre>/g, '<pre class="mermaid">$1</pre>');
  writeFileSync(md.replace(/\.md$/, '.html'), out);
  console.log(`built docs/final/${file.replace(/\.md$/, '.html')}`);
}
