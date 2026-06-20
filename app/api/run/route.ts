import { NextResponse } from 'next/server';
import {
  getAnthropic,
  maxTokensFor,
  resolveModel,
  toFriendlyError,
  withRetry,
} from '@/lib/anthropic';
import { buildSystemPrompt } from '@/lib/skill';
import { getStage } from '@/lib/stages';
import { validateRunRequest } from '@/lib/validation';
import { checkRateLimit } from '@/lib/ratelimit';
import { getSessionUser } from '@/lib/session';
import { logUsage, saveHistory } from '@/lib/usage';

export const runtime = 'nodejs';
export const maxDuration = 60;

export async function POST(req: Request) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Rate limit per session user.
  const rate = await checkRateLimit(user);
  if (!rate.success) {
    return NextResponse.json(
      { error: `Rate limit reached. Retry in ${rate.retryAfter}s.` },
      { status: 429, headers: { 'Retry-After': String(rate.retryAfter) } }
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 });
  }

  const validation = validateRunRequest(body);
  if (!validation.ok) {
    return NextResponse.json({ error: validation.error }, { status: 400 });
  }
  const { mode, input, model } = validation.value;

  const stage = getStage(mode);
  if (!stage) {
    return NextResponse.json({ error: 'Unknown stage.' }, { status: 400 });
  }

  const effectiveModel = resolveModel(mode, model);
  const system = buildSystemPrompt(mode, stage.renderer);

  const anthropic = getAnthropic();

  try {
    const stream = await withRetry(() =>
      Promise.resolve(
        anthropic.messages.stream({
          model: effectiveModel,
          max_tokens: maxTokensFor(mode),
          system,
          messages: [{ role: 'user', content: input }],
        })
      )
    );

    const encoder = new TextEncoder();
    let full = '';

    const readable = new ReadableStream<Uint8Array>({
      async start(controller) {
        try {
          stream.on('text', (text) => {
            full += text;
            controller.enqueue(encoder.encode(text));
          });

          const message = await stream.finalMessage();

          // Fire-and-forget persistence; never block the response on it.
          const usage = message.usage;
          void logUsage({
            mode,
            model: effectiveModel,
            inputTokens: usage?.input_tokens ?? 0,
            outputTokens: usage?.output_tokens ?? 0,
            ts: Date.now(),
            user,
          });
          void saveHistory(user, {
            mode,
            model: effectiveModel,
            input,
            output: full,
          });

          controller.close();
        } catch (err) {
          // Surface a terminal error marker the client can detect mid-stream.
          const friendly = toFriendlyError(err);
          controller.enqueue(encoder.encode(`\n\n[[ERROR]] ${friendly.message}`));
          controller.close();
        }
      },
      cancel() {
        stream.abort();
      },
    });

    return new Response(readable, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-store',
        'X-Model': effectiveModel,
        'X-Content-Type-Options': 'nosniff',
      },
    });
  } catch (err) {
    const friendly = toFriendlyError(err);
    return NextResponse.json({ error: friendly.message }, { status: friendly.status });
  }
}
