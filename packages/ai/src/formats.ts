import {
  Advisory,
  ExecutiveSummary,
  LinkedInPost,
  type FormatId,
} from '@ps154/shared';

export const FORMAT_SCHEMAS = {
  advisory: Advisory,
  executive_summary: ExecutiveSummary,
  linkedin_post: LinkedInPost,
} as const;

export type Phase1FormatId = keyof typeof FORMAT_SCHEMAS;

export function isPhase1Format(
  format: FormatId
): format is Phase1FormatId {
  return format in FORMAT_SCHEMAS;
}

export function getFormatSchema(format: Phase1FormatId) {
  return FORMAT_SCHEMAS[format];
}