import type { Claim, Span } from '@ps154/shared';

const STOP_WORDS = new Set([
  'the',
  'a',
  'an',
  'and',
  'or',
  'of',
  'to',
  'in',
  'on',
  'at',
  'for',
  'with',
  'from',
  'is',
  'are',
  'was',
  'were',
  'be',
  'this',
  'that',
  'these',
  'those',
]);

function tokenize(text: string): Set<string> {
  return new Set(
    text
      .toLowerCase()
      .replace(/[^\p{L}\p{N}._[\]-]+/gu, ' ')
      .split(/\s+/)
      .filter(
        (token) =>
          token.length > 2 &&
          !STOP_WORDS.has(token)
      )
  );
}

function overlapScore(
  claimText: string,
  sourceText: string
): number {
  const claimTokens = tokenize(claimText);
  const sourceTokens = tokenize(sourceText);

  if (claimTokens.size === 0) {
    return 0;
  }

  let matches = 0;

  for (const token of claimTokens) {
    if (sourceTokens.has(token)) {
      matches++;
    }
  }

  return matches / claimTokens.size;
}

export interface GroundingResult {
  claims: Claim[];
  scores: Record<string, number>;
}

export function groundClaims(
  claims: Claim[],
  spans: Span[]
): GroundingResult {
  const spanMap = new Map(
    spans.map((span) => [
      span.span_id,
      span.text,
    ])
  );

  const scores: Record<string, number> = {};

  const groundedClaims = claims.map((claim) => {
    const citedSpans = claim.source_refs
      .map((ref) => spanMap.get(ref))
      .filter(
        (text): text is string =>
          typeof text === 'string'
      );

    if (citedSpans.length === 0) {
      scores[claim.id] = 0;

      return {
        ...claim,
        grounded: false,
      };
    }

    const bestScore = Math.max(
      ...citedSpans.map((span) =>
        overlapScore(claim.text, span)
      )
    );

    scores[claim.id] = bestScore;

    return {
      ...claim,
      grounded: bestScore >= 0.5,
    };
  });

  return {
    claims: groundedClaims,
    scores,
  };
}