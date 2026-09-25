import { z } from 'zod';
import { ClaimNode } from './claim';
import { Severity } from './canonical';

export const FormatId = z.enum([
  'advisory',
  'executive_summary',
  'linkedin_post',
  'x_thread',
  'video_package',
]);

export type FormatId = z.infer<typeof FormatId>;

export const Advisory = z.object({
  title: z.string(),
  severity: Severity,
  summary: z.array(ClaimNode).min(1).max(4),
  affected_systems: z.array(ClaimNode),
  indicators: z.array(
    z.object({
      type: z.string(),
      value: z.string(),
      source_refs: z.array(z.string()),
    })
  ),
  mitigations: z.array(ClaimNode).min(1),
  references: z.array(z.string()),
});

export const ExecutiveSummary = z.object({
  headline: z.string(),
  key_points: z.array(ClaimNode).min(3).max(5),
  impact: z.array(ClaimNode).min(1).max(3),
  decisions_required: z.array(ClaimNode).min(1).max(3),
});

export const LinkedInPost = z.object({
  hook: ClaimNode,
  body: z.array(ClaimNode).min(2).max(10),
  hashtags: z.array(z.string()).max(5),
});

export const XThread = z.object({
  tweets: z
    .array(
      z.object({
        index: z.number().int(),
        sentences: z.array(ClaimNode).min(1),
      })
    )
    .min(3)
    .max(7),
});

export const VideoPackage = z.object({
  title: z.string(),
  total_duration: z.number().int().positive(),
  scenes: z
    .array(
      z.object({
        n: z.number().int(),
        duration: z.number().int().positive(),
        visual: z.string(),
        on_screen_text: ClaimNode,
        narration: ClaimNode,
      })
    )
    .min(3)
    .max(12),
});

export const OutputSchemas = {
  advisory: Advisory,
  executive_summary: ExecutiveSummary,
  linkedin_post: LinkedInPost,
  x_thread: XThread,
  video_package: VideoPackage,
} satisfies Record<FormatId, z.ZodType>;    