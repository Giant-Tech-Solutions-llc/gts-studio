import 'server-only';
import { Redis } from '@upstash/redis';

// Single shared Redis client. Returns null when KV env is absent so the app
// runs locally without a store (rate limiting + history degrade gracefully).

let cached: Redis | null | undefined;

export function getRedis(): Redis | null {
  if (cached !== undefined) return cached;

  const url = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;

  if (!url || !token) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn(
        '[kv] KV_REST_API_URL/KV_REST_API_TOKEN not set — rate limiting and history are disabled.'
      );
    }
    cached = null;
    return cached;
  }

  cached = new Redis({ url, token });
  return cached;
}

export const kvEnabled = () => getRedis() !== null;
