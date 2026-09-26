import { z } from 'zod';
import {
  Canonical,
  type Span,
  type Classification,
} from '@ps154/shared';

import type { Router, Routed } from './router';
import { EXTRACTION_SYSTEM } from './prompts';
import { parseModelJson } from './json';

export interface SourceForAI {
  id: string;
  classification: Classification;
  spans: Span[];
  raw_content: string;
  source_hash: string;
}

const schema = z.toJSONSchema(Canonical);

export async function extractCanonical(
  router: Router,
  source: SourceForAI
) {
  const system = EXTRACTION_SYSTEM.replace(
    '{{schema}}',
    JSON.stringify(schema)
  );

  const user = `<source>
${source.spans
  .map((s) => `[${s.span_id}] ${s.text}`)
  .join('\n')}
</source>`;

  let res: Routed | undefined;
  let problem = '';

  for (let attempt = 1; attempt <= 2; attempt++) {
    res = await router.call({
      system,
      jsonSchema: schema,
      classification: source.classification,

      user:
        attempt === 1
          ? user
          : `${user}

Your previous reply was invalid: ${problem}

Return the complete corrected JSON.`,
    });

    const parsed = Canonical.safeParse(
      parseModelJson(res.text)
    );

    if (parsed.success) {
      return {
        canonical: keepKnownRefs(
          parsed.data,
          new Set(source.spans.map((s) => s.span_id))
        ),

        meta: {
          provider: res.provider,
          model: res.model,
          fallback_reason: res.fallback_reason,
          latency_ms: res.latency_ms,
          attempts: attempt,
        },
      };
    }

    problem = parsed.error.issues
      .slice(0, 8)
      .map(
        (i) => `${i.path.join('.')}: ${i.message}`
      )
      .join('; ');
  }

  throw Object.assign(
    new Error(
      'Canonical extraction failed validation twice'
    ),
    {
      code: 'EXTRACTION_INVALID',
    }
  );
}

/**
 * Drop span ids the model invented,
 * then drop items left with no source.
 */
function keepKnownRefs(
  c: Canonical,
  known: Set<string>
): Canonical {
  const clean = <
    T extends { source_refs: string[] }
  >(
    items: T[]
  ) =>
    items
      .map((i) => ({
        ...i,
        source_refs: i.source_refs.filter((r) =>
          known.has(r)
        ),
      }))
      .filter(
        (i) => i.source_refs.length > 0
      );

  return {
    ...c,

    severity: {
      ...c.severity,
      source_refs:
        c.severity.source_refs.filter((r) =>
          known.has(r)
        ),
    },

    entities: clean(c.entities),
    events: clean(c.events),
    affected_systems: clean(c.affected_systems),
    indicators: clean(c.indicators),
    key_facts: clean(c.key_facts),
    recommendations: clean(c.recommendations),
  };
}