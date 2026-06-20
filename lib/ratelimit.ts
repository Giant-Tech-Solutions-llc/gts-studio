import 'server-only';
import { Ratelimit } from '@upstash/ratelimit';
import { getRedis } from './kv';

// Sliding-window limiter keyed per user. No-ops (always allows) when KV is off.

let cached: Ratelimit | null | undefined;

function getLimiter(): Ratelimit | null {
  if (cached !== undefined) return cached;
  const redis = getRedis();
  if (!redis) {
    cached = null;
    return cached;
  }
  const perMinute = Number(process.env.RATE_LIMIT_PER_MINUTE) || 30;
  cached = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(perMinute, '60 s'),
    prefix: 'seo:rl',
    analytics: false,
  });
  return cached;
}

export interface RateResult {
  success: boolean;
  limit: number;
  remaining: number;
  /** Seconds until the client may retry (0 when allowed). */
  retryAfter: number;
}

export async function checkRateLimit(userKey: string): Promise<RateResult> {
  const limiter = getLimiter();
  if (!limiter) {
    return { success: true, limit: 0, remaining: 0, retryAfter: 0 };
  }
  const { success, limit, remaining, reset } = await limiter.limit(userKey);
  const retryAfter = success ? 0 : Math.max(1, Math.ceil((reset - Date.now()) / 1000));
  return { success, limit, remaining, retryAfter };
}
