import type { Redis } from 'ioredis';

import {
  cloud,
  local,
  TransportError,
  RateLimitError,
  type LLMRequest,
  type LLMResponse,
} from './adapters';

import { Redactor } from './redact';
import { env } from './env';

export type FallbackReason =
  | 'policy'
  | 'rate_limit'
  | 'network';

export interface Routed extends LLMResponse {
  fallback_reason: FallbackReason | null;
}

const sleep = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

export function createRouter(redis: Redis) {
  async function cloudHasCapacity() {
    const n = await redis.incr('ratelimit:provider:cloud');

    if (n === 1) {
      await redis.expire(
        'ratelimit:provider:cloud',
        60
      );
    }

    return n <= env.CLOUD_RPM;
  }

  async function onLocal(
    req: LLMRequest,
    reason: FallbackReason
  ): Promise<Routed> {
    return {
      ...(await local.generate(req)),
      fallback_reason: reason,
    };
  }

  /**
   * The only way any prompt leaves this package.
   */
  async function call(
    req: LLMRequest
  ): Promise<Routed> {
    // Restricted → local only.
    if (req.classification === 'restricted') {
      return onLocal(req, 'policy');
    }

    // Cloud RPM limit reached → local.
    if (!(await cloudHasCapacity())) {
      return onLocal(req, 'rate_limit');
    }

    // Internal → redact before cloud.
    const redactor =
      req.classification === 'internal'
        ? new Redactor()
        : null;

    const outbound = redactor
      ? redactor.maskRequest(req)
      : req;

    let reason: FallbackReason = 'network';

    // First attempt + two transport retries.
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        const res = await cloud.generate(outbound);

        return {
          ...res,
          text: redactor
            ? redactor.unmask(res.text)
            : res.text,
          fallback_reason: null,
        };
      } catch (error) {
        if (error instanceof RateLimitError) {
          reason = 'rate_limit';
          break;
        }

        if (!(error instanceof TransportError)) {
          throw error;
        }

        await sleep(500 * 2 ** attempt);
      }
    }

    // Local receives the original, unmasked request.
    // It never leaves the host.
    return onLocal(req, reason);
  }

  return { call };
}

export type Router = ReturnType<typeof createRouter>;