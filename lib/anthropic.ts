import 'server-only';
import Anthropic from '@anthropic-ai/sdk';
import { getStage, type ModelId } from './stages';

let client: Anthropic | null = null;

export function getAnthropic(): Anthropic {
  if (client) return client;
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error('ANTHROPIC_API_KEY is not set.');
  client = new Anthropic({ apiKey });
  return client;
}

// Opus is only permitted where the stage opts in (Stage 0 and Stage 4).
// Everything else is forced to the Sonnet default, server-side.
export function resolveModel(mode: number, requested: ModelId): ModelId {
  const stage = getStage(mode);
  if (requested === 'claude-opus-4-8' && stage?.allowOpus) return 'claude-opus-4-8';
  return 'claude-sonnet-4-6';
}

export function maxTokensFor(mode: number): number {
  // Stage 4 writes a full article; the rest emit compact structured output.
  return mode === 4 ? 8000 : 4000;
}

export interface FriendlyError {
  status: number;
  message: string;
}

// Map SDK/API errors to clean user messages — never leak stack traces.
export function toFriendlyError(err: unknown): FriendlyError {
  if (err instanceof Anthropic.APIError) {
    const status = err.status ?? 500;
    if (status === 401) return { status: 502, message: 'Server auth to the model failed. Check the API key.' };
    if (status === 429) return { status: 429, message: 'The model is rate limiting requests. Try again shortly.' };
    if (status === 529 || status === 503) {
      return { status: 503, message: 'The model is temporarily overloaded. Try again in a moment.' };
    }
    if (status === 400) return { status: 400, message: 'The request was rejected by the model. Shorten or adjust your input.' };
    return { status: 502, message: 'The model service returned an error. Try again.' };
  }
  if (err instanceof Error && err.message.includes('ANTHROPIC_API_KEY')) {
    return { status: 500, message: 'Server is misconfigured (missing API key).' };
  }
  return { status: 500, message: 'Something went wrong handling the request.' };
}

// Retry-once-with-backoff wrapper for transient 429/529 on the initial call.
export async function withRetry<T>(fn: () => Promise<T>): Promise<T> {
  try {
    return await fn();
  } catch (err) {
    if (err instanceof Anthropic.APIError && (err.status === 429 || err.status === 529)) {
      await new Promise((r) => setTimeout(r, 1200));
      return await fn();
    }
    throw err;
  }
}
