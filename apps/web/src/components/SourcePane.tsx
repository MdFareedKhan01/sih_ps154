import type { Span } from '@ps154/shared';

/**
 * Placeholder for Step 4/5. Renders the raw source text as-is.
 * Step 7 replaces this with span-aware rendering that highlights the
 * passage matching `active` (the selected claim's source_refs).
 */
export function SourcePane({ raw }: { raw: string; spans: Span[]; active: Set<string> }) {
  return <pre className="whitespace-pre-wrap text-sm">{raw}</pre>;
}
