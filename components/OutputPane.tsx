'use client';

import { useMemo, useState } from 'react';
import { getStage, MODELS, type ModelId, type Stage } from '@/lib/stages';
import { downloadFile, splitError, tryParseJson } from '@/lib/output';
import JsonView from './JsonView';
import MarkdownView from './MarkdownView';

export type RunStatus = 'idle' | 'streaming' | 'done' | 'error';

interface Props {
  stage: Stage;
  status: RunStatus;
  text: string;
  errorMessage: string | null;
  modelUsed: ModelId | null;
  onStop: () => void;
  onSendToNext: (targetStageId: number, output: string) => void;
}

function ActionButton({
  children,
  onClick,
  disabled,
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="rounded-md border border-border bg-surface px-2.5 py-1.5 text-xs font-medium text-fg transition-colors hover:bg-elevated disabled:cursor-not-allowed disabled:opacity-50"
    >
      {children}
    </button>
  );
}

export default function OutputPane({
  stage,
  status,
  text,
  errorMessage,
  modelUsed,
  onStop,
  onSendToNext,
}: Props) {
  const [rawMode, setRawMode] = useState(false);
  const [copied, setCopied] = useState(false);

  const { body, error: inlineError } = useMemo(() => splitError(text), [text]);
  const parsedJson = useMemo(
    () => (stage.renderer === 'json' ? tryParseJson(body) : null),
    [stage.renderer, body]
  );

  const effectiveError = errorMessage ?? inlineError;
  const hasContent = body.trim().length > 0;
  const nextStage = stage.feedsInto !== null ? getStage(stage.feedsInto) : undefined;

  async function copy() {
    try {
      await navigator.clipboard.writeText(body);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* ignore */
    }
  }

  function download() {
    const isJson = stage.renderer === 'json' && parsedJson !== null;
    const ext = stage.renderer === 'markdown' ? 'md' : isJson ? 'json' : 'txt';
    const mime =
      ext === 'json' ? 'application/json' : ext === 'md' ? 'text/markdown' : 'text/plain';
    downloadFile(`${stage.key}-output.${ext}`, body, mime);
  }

  return (
    <section
      aria-label="Output"
      className="flex h-full min-h-0 flex-col rounded-lg border border-border bg-surface"
    >
      <header className="flex items-center justify-between gap-2 border-b border-border px-4 py-2.5">
        <div className="flex items-center gap-2 text-sm font-semibold">
          Output
          {modelUsed && (
            <span className="rounded bg-elevated px-1.5 py-0.5 text-[11px] font-normal text-muted">
              {MODELS[modelUsed].label}
            </span>
          )}
          {status === 'streaming' && (
            <span className="inline-flex items-center gap-1 text-[11px] font-normal text-accent">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent" />
              streaming
            </span>
          )}
        </div>
        <div className="flex items-center gap-1.5">
          {status === 'streaming' && (
            <button
              type="button"
              onClick={onStop}
              className="rounded-md border border-border bg-surface px-2.5 py-1.5 text-xs font-medium text-fg hover:bg-elevated"
            >
              ■ Stop
            </button>
          )}
          {stage.renderer === 'json' && parsedJson !== null && status !== 'streaming' && (
            <ActionButton onClick={() => setRawMode((r) => !r)}>
              {rawMode ? 'Tree' : 'Raw'}
            </ActionButton>
          )}
          <ActionButton onClick={copy} disabled={!hasContent}>
            {copied ? 'Copied' : 'Copy'}
          </ActionButton>
          <ActionButton onClick={download} disabled={!hasContent}>
            Download
          </ActionButton>
          {nextStage && hasContent && status === 'done' && (
            <ActionButton onClick={() => onSendToNext(nextStage.id, body)}>
              → {nextStage.name}
            </ActionButton>
          )}
        </div>
      </header>

      <div className="min-h-0 flex-1 overflow-auto p-4">
        {/* Empty state */}
        {status === 'idle' && !hasContent && (
          <div className="flex h-full flex-col items-center justify-center text-center text-muted">
            <p className="text-sm">No output yet.</p>
            <p className="mt-1 text-xs">Fill the form and run {stage.name}.</p>
          </div>
        )}

        {/* Skeleton while waiting for first tokens */}
        {status === 'streaming' && !hasContent && (
          <div className="space-y-2.5" aria-hidden>
            <div className="skeleton h-4 w-3/4 rounded" />
            <div className="skeleton h-4 w-full rounded" />
            <div className="skeleton h-4 w-5/6 rounded" />
            <div className="skeleton h-4 w-2/3 rounded" />
          </div>
        )}

        {/* Error state */}
        {status === 'error' && !hasContent && (
          <div
            role="alert"
            className="rounded-md border border-red-300 bg-red-50 p-4 text-sm text-red-800 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200"
          >
            {effectiveError ?? 'Something went wrong.'}
          </div>
        )}

        {/* Content */}
        {hasContent && (
          <>
            {effectiveError && (
              <div
                role="alert"
                className="mb-3 rounded-md border border-red-300 bg-red-50 p-2.5 text-xs text-red-800 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200"
              >
                {effectiveError}
              </div>
            )}

            {stage.renderer === 'json' && parsedJson !== null && !rawMode && status !== 'streaming' ? (
              <JsonView data={parsedJson as never} />
            ) : stage.renderer === 'markdown' && status !== 'streaming' ? (
              <MarkdownView content={body} />
            ) : (
              <pre className="whitespace-pre-wrap break-words font-mono text-[13px] leading-relaxed text-fg">
                {body}
                {status === 'streaming' && <span className="ml-0.5 inline-block animate-pulse">▍</span>}
              </pre>
            )}
          </>
        )}
      </div>
    </section>
  );
}
