import { z } from 'zod';

import type {
  Canonical,
  Config,
  FormatId,
} from '@ps154/shared';

import type { Router, Routed } from './router';
import {
  ADVISORY_SYSTEM,
  EXECUTIVE_SUMMARY_SYSTEM,
  LINKEDIN_SYSTEM,
} from './prompts';
import {
  getFormatSchema,
  isPhase1Format,
  type Phase1FormatId,
} from './formats';
import { parseModelJson } from './json';
import { collectClaims } from './claims';
import { groundClaims } from './grounding';
import type { Span } from '@ps154/shared';

const PROMPTS: Record<
  Phase1FormatId,
  string
> = {
  advisory: ADVISORY_SYSTEM,
  executive_summary: EXECUTIVE_SUMMARY_SYSTEM,
  linkedin_post: LINKEDIN_SYSTEM,
};

export interface RunFormatInput {
  canonical: Canonical;
  spans: Span[];
  format: FormatId;
  config: Config;
  classification: 'public' | 'internal' | 'restricted';
}

export async function runFormat(
  router: Router,
  input: RunFormatInput
) {
  if (!isPhase1Format(input.format)) {
    throw new Error(
      `Format "${input.format}" is not available in Phase 1`
    );
  }

  const schema = getFormatSchema(input.format);
  const system = PROMPTS[input.format]
    .replace(
      '{{canonical}}',
      JSON.stringify(input.canonical)
    )
    .replace(
      '{{schema}}',
      JSON.stringify(z.toJSONSchema(schema))
    );

  const user = JSON.stringify({
    audience: input.config.audience,
    tone: input.config.tone,
    detail: input.config.detail,
    language: input.config.language,
  });

  const res: Routed = await router.call({
    system,
    user,
    jsonSchema: z.toJSONSchema(schema),
    classification: input.classification,
  });

  const parsed = schema.safeParse(
    parseModelJson(res.text)
  );

  if (!parsed.success) {
    throw Object.assign(
      new Error(
        `Format "${input.format}" failed validation`
      ),
      {
        code: 'FORMAT_INVALID',
        issues: parsed.error.issues,
      }
    );
  }

  const claims = collectClaims(
    input.format,
    parsed.data
  );

  const grounding = groundClaims(
    claims,
    input.spans
  );

  return {
    format: input.format,
    artifact: parsed.data,
    claims: grounding.claims,
    grounding: {
      scores: grounding.scores,
      grounded_count:
        grounding.claims.filter(
          (claim) => claim.grounded
        ).length,
      total_claims: grounding.claims.length,
    },
    meta: {
      provider: res.provider,
      model: res.model,
      fallback_reason: res.fallback_reason,
      latency_ms: res.latency_ms,
    },
  };
}