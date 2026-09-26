import type { Redis } from 'ioredis';

import { createRouter } from './router';
import {
  extractCanonical,
  type SourceForAI,
} from './extract';

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
  };
}

export type Engine = ReturnType<
  typeof createEngine
>;