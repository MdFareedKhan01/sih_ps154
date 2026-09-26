import type { ClaimNode, Claim, Span } from '@ps154/shared';

const STATUSES = new Set([
  'fact',
  'inference',
  'framing',
]);

export const isClaimNode = (
  v: unknown
): v is ClaimNode =>
  !!v &&
  typeof v === 'object' &&
  typeof (v as any).text === 'string' &&
  STATUSES.has((v as any).status) &&
  Array.isArray((v as any).source_refs);

export type Node = ClaimNode & {
  id: string;
  grounded?: boolean;
};

/**
 * Deep-copies content, gives every claim node an id,
 * and returns the nodes in reading order.
 *
 * The returned nodes ARE the objects inside the copy,
 * so setting node.grounded later updates the content
 * that gets rendered.
 */
export function collectClaims(
  content: unknown
): {
  content: unknown;
  nodes: Node[];
} {
  const nodes: Node[] = [];

  const walk = (v: unknown): unknown => {
    if (isClaimNode(v)) {
      const node: Node = {
        ...v,
        id: `c${nodes.length + 1}`,
      };

      nodes.push(node);

      return node;
    }

    if (Array.isArray(v)) {
      return v.map(walk);
    }

    if (v && typeof v === 'object') {
      return Object.fromEntries(
        Object.entries(v).map(([k, x]) => [
          k,
          walk(x),
        ])
      );
    }

    return v;
  };

  return {
    content: walk(content),
    nodes,
  };
}

const STOP = new Set([
  'that',
  'this',
  'with',
  'from',
  'have',
  'been',
  'were',
  'which',
  'their',
  'there',
  'about',
  'into',
  'after',
  'before',
  'while',
  'would',
  'could',
  'should',
  'these',
  'those',
  'other',
  'than',
  'then',
  'also',
  'only',
  'such',
  'they',
  'them',
  'will',
  'more',
]);

/**
 * Extract meaningful terms from text.
 *
 * Four or more letters/numbers are considered.
 * Devanagari combining marks are preserved.
 */
export const terms = (s: string) =>
  new Set(
    (
      s
        .toLowerCase()
        .normalize('NFKC')
        .match(
          /[\p{L}\p{M}\p{N}]{4,}/gu
        ) ?? []
    ).filter((w) => !STOP.has(w))
  );

/**
 * Find the source span with the strongest lexical overlap
 * with a claim.
 *
 * A reference is repaired only when at least 50% of the
 * claim's terms occur in a source span.
 */
export function postHocRefs(
  text: string,
  spans: Span[]
): string[] {
  const t = terms(text);

  if (t.size === 0) {
    return [];
  }

  let best = {
    id: '',
    score: 0,
  };

  for (const s of spans) {
    const st = terms(s.text);

    let shared = 0;

    for (const w of t) {
      if (st.has(w)) {
        shared++;
      }
    }

    if (
      shared / t.size >
      best.score
    ) {
      best = {
        id: s.span_id,
        score: shared / t.size,
      };
    }
  }

  return best.score >= 0.5
    ? [best.id]
    : [];
}

/**
 * Calculate the proportion of grounded claims.
 *
 * Framing claims are excluded from the calculation.
 */
export function groundingScore(
  claims: Claim[]
): number {
  const scored = claims.filter(
    (c) => c.status !== 'framing'
  );

  if (scored.length === 0) {
    return 1;
  }

  return (
    Math.round(
      (
        scored.filter(
          (c) => c.grounded
        ).length /
        scored.length
      ) * 100
    ) / 100
  );
}