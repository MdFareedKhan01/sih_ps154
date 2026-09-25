import type { LLMRequest } from './adapters';
import { env } from './env';

const TLD =
  '(?:com|net|org|in|io|info|biz|co|ru|cn|xyz|top|online|site|gov|edu)';

const PATTERNS: [string, RegExp][] = [
  ['URL', /\bhttps?:\/\/[^\s"<>]+/gi],
  ['EMAIL', /\b[\w.+-]+@[\w-]+(?:\.[\w-]+)+\b/g],
  ['IP', /\b(?:\d{1,3}\.){3}\d{1,3}\b/g],
  [
    'DOMAIN',
    new RegExp(
      `\\b(?:[a-z0-9-]+(?:\\.|\\[\\.]))+${TLD}\\b`,
      'gi'
    ),
  ],
];

export class Redactor {
  private toPlaceholder = new Map<string, string>();
  private toOriginal = new Map<string, string>();

  private counts: Record<string, number> = {};

  mask(text: string): string {
    let out = text;

    for (const [kind, re] of PATTERNS) {
      out = out.replace(re, (match) =>
        this.placeholder(kind, match)
      );
    }

    for (const term of env.REDACT_TERMS) {
      out = out
        .split(term)
        .join(this.placeholder('NAME', term));
    }

    return out;
  }

  unmask(text: string): string {
    return text.replace(
      /<<[A-Z]+_\d+>>/g,
      (placeholder) =>
        this.toOriginal.get(placeholder) ?? placeholder
    );
  }

  maskRequest(req: LLMRequest): LLMRequest {
    return {
      ...req,
      user:
        this.mask(req.user) +
        '\n\nValues written like <<IP_1>> are masked identifiers. Copy them exactly.',
    };
  }

  private placeholder(
    kind: string,
    original: string
  ): string {
    const seen = this.toPlaceholder.get(original);

    if (seen) {
      return seen;
    }

    const count =
      (this.counts[kind] ?? 0) + 1;

    this.counts[kind] = count;

    const placeholder = `<<${kind}_${count}>>`;

    this.toPlaceholder.set(original, placeholder);
    this.toOriginal.set(placeholder, original);

    return placeholder;
  }
}