import 'server-only';
import { Redis } from '@upstash/redis';

// Single shared Redis client. Returns null when KV env is absent so the app
// runs locally without a store (rate limiting + history degrade gracefully).

let cached: Redis | null | undefined;

export function getRedis(): Redis | null {
  if (cached !== undefined) return cached;

  // Accept either naming convention: the older Vercel KV vars
  // (KV_REST_API_*) or the Upstash Marketplace vars (UPSTASH_REDIS_REST_*).
  const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn(
        '[kv] No KV credentials (KV_REST_API_URL/TOKEN or UPSTASH_REDIS_REST_URL/TOKEN) — rate limiting and history are disabled.'
      );
    }
    cached = null;
    return cached;
  }

  cached = new Redis({ url, token });
  return cached;
}

export const kvEnabled = () => getRedis() !== null;
