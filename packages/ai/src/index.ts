import type { Redis } from 'ioredis';

import { createRouter } from './router';
import {
  extractCanonical,
  type SourceForAI,
} from './extract';
import {
  runFormat,
  type RunFormatInput,
} from './generate';

export function createEngine({
  redis,
}: {
  redis: Redis;
}) {
  const router = createRouter(redis);

  return {
    extractCanonical: (
      source: SourceForAI
    ) => extractCanonical(router, source),

    runFormat: (
      input: RunFormatInput
    ) => runFormat(router, input),
  };
}

export type Engine = ReturnType<
  typeof createEngine
>;