import { z } from 'zod';

export const ClaimStatus = z.enum([
  'fact',
  'inference',
  'framing',
]);

export type ClaimStatus = z.infer<typeof ClaimStatus>;

/** What the model writes for every sentence-level assertion. */
export const ClaimNode = z.object({
  text: z.string().min(1),
  source_refs: z.array(z.string()),
  status: ClaimStatus,
});

export type ClaimNode = z.infer<typeof ClaimNode>;

/** What the server stores and the client renders: the node plus verdicts. */
export const Claim = ClaimNode.extend({
  id: z.string(),
  grounded: z.boolean(),
});

export type Claim = z.infer<typeof Claim>;

export const Span = z.object({
  span_id: z.string(),
  text: z.string(),
  start_offset: z.number().int(),
  end_offset: z.number().int(),
  page: z.number().int().optional(),
});

export type Span = z.infer<typeof Span>;