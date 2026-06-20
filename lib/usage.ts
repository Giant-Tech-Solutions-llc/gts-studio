import 'server-only';
import { getRedis } from './kv';

// Usage logging + run history in KV. No PII: we store the random session
// subject, the mode, token counts, and timestamps only.

const HISTORY_MAX = 50;

export interface UsageRecord {
  mode: number;
  model: string;
  inputTokens: number;
  outputTokens: number;
  ts: number;
  user: string;
}

export interface HistoryEntry {
  id: string;
  mode: number;
  model: string;
  input: string;
  output: string;
  ts: number;
}

function historyKey(user: string): string {
  return `seo:history:${user}`;
}

export async function logUsage(rec: UsageRecord): Promise<void> {
  const redis = getRedis();
  if (!redis) return;
  try {
    // Daily usage log list (billing/audit). No PII.
    const day = new Date(rec.ts).toISOString().slice(0, 10);
    await redis.rpush(`seo:usage:${day}`, JSON.stringify(rec));
  } catch (err) {
    console.error('[usage] failed to log usage', err);
  }
}

export async function saveHistory(
  user: string,
  entry: Omit<HistoryEntry, 'id' | 'ts'>
): Promise<HistoryEntry | null> {
  const redis = getRedis();
  if (!redis) return null;
  const full: HistoryEntry = {
    ...entry,
    id: crypto.randomUUID(),
    ts: Date.now(),
  };
  try {
    const key = historyKey(user);
    await redis.lpush(key, JSON.stringify(full));
    await redis.ltrim(key, 0, HISTORY_MAX - 1);
    return full;
  } catch (err) {
    console.error('[history] failed to save', err);
    return null;
  }
}

export async function listHistory(user: string): Promise<HistoryEntry[]> {
  const redis = getRedis();
  if (!redis) return [];
  try {
    const raw = await redis.lrange(historyKey(user), 0, HISTORY_MAX - 1);
    return raw
      .map((r) => {
        if (typeof r === 'object' && r !== null) return r as HistoryEntry;
        try {
          return JSON.parse(r as string) as HistoryEntry;
        } catch {
          return null;
        }
      })
      .filter((x): x is HistoryEntry => x !== null);
  } catch (err) {
    console.error('[history] failed to list', err);
    return [];
  }
}
