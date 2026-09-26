import 'dotenv/config';

import fs from 'node:fs';
import { createHash } from 'node:crypto';
import Redis from 'ioredis';

import { createEngine } from '../src/index';
import type {
  Classification,
  Span,
} from '@ps154/shared';

function splitSpans(raw: string): Span[] {
  return raw.split(/\r?\n/).map((text, index) => ({
    span_id: `span_${index + 1}`,
    text,
    start_offset: 0,
    end_offset: text.length,
  }));
}

const args = process.argv.slice(2);

const [file, classification = 'public'] = args;

if (!file) {
  console.error(
    'Usage: npm run try -- <file> <classification>'
  );
  process.exit(1);
}

if (
  !['public', 'internal', 'restricted'].includes(
    classification
  )
) {
  console.error(
    'Classification must be public, internal, or restricted'
  );
  process.exit(1);
}

const raw = fs.readFileSync(file, 'utf8');

const redis = new Redis(
  process.env.REDIS_URL ??
    'redis://localhost:6379'
);

const engine = createEngine({ redis });

const source = {
  id: 'cli',
  classification: classification as Classification,
  spans: splitSpans(raw),
  raw_content: raw,
  source_hash: createHash('sha256')
    .update(raw)
    .digest('hex'),
};

try {
  const { canonical, meta } =
    await engine.extractCanonical(source);

  console.log('\n=== EXTRACT ===');
  console.dir(meta, { depth: 4 });

  console.log('\n=== CANONICAL ===');
  console.dir(canonical, { depth: 6 });

  const config = {
    audience: 'senior government officials',
    tone: 'formal' as const,
    detail: 'medium' as const,
    language: 'en' as const,
  };

  const formats = [
    'advisory',
    'executive_summary',
    'linkedin_post',
  ] as const;

  for (const format of formats) {
    console.log(`\n=== ${format.toUpperCase()} ===`);

    const result = await engine.runFormat({
      canonical,
      spans: source.spans,
      format,
      config,
      classification: source.classification,
    });

    console.dir(result, { depth: 8 });
  }
} finally {
  await redis.quit();
}