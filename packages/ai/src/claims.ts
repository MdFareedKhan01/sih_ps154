import {
  Claim,
  ClaimNode,
  type FormatId,
} from '@ps154/shared';

export function collectClaims(
  format: FormatId,
  output: unknown
): Claim[] {
  const nodes = extractClaimNodes(output);

  return nodes.map((node, index) => ({
    id: `${format}_claim_${index + 1}`,
    text: node.text,
    source_refs: node.source_refs,
    status: node.status,
    grounded: false,
  }));
}

function extractClaimNodes(
  value: unknown
): ClaimNode[] {
  const claims: ClaimNode[] = [];

  function visit(node: unknown) {
    if (!node || typeof node !== 'object') {
      return;
    }

    if (isClaimNode(node)) {
      claims.push(node);
      return;
    }

    if (Array.isArray(node)) {
      for (const item of node) {
        visit(item);
      }
      return;
    }

    for (const child of Object.values(node)) {
      visit(child);
    }
  }

  visit(value);

  return claims;
}

function isClaimNode(
  value: object
): value is ClaimNode {
  const candidate = value as Record<string, unknown>;

  return (
    typeof candidate.text === 'string' &&
    Array.isArray(candidate.source_refs) &&
    typeof candidate.status === 'string' &&
    ['fact', 'inference', 'framing'].includes(
      candidate.status
    )
  );
}