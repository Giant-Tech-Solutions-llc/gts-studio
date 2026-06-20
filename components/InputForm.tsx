'use client';

import { useMemo, useState } from 'react';
import {
  composeInput,
  INPUT_CHAR_CAP,
  MODELS,
  type ModelId,
  type Stage,
} from '@/lib/stages';
import type { RunStatus } from './OutputPane';

interface Props {
  stage: Stage;
  values: Record<string, string>;
  onChange: (name: string, value: string) => void;
  model: ModelId;
  onModelChange: (m: ModelId) => void;
  status: RunStatus;
  onRun: () => void;
  onStop: () => void;
}

export default function InputForm({
  stage,
  values,
  onChange,
  model,
  onModelChange,
  status,
  onRun,
  onStop,
}: Props) {
  const [confirmed, setConfirmed] = useState(false);

  const composed = useMemo(() => composeInput(stage, values), [stage, values]);
  const charCount = composed.length;
  const overCap = charCount > INPUT_CHAR_CAP;

  const missingRequired = stage.fields.some(
    (f) => f.required && !(values[f.name] ?? '').trim()
  );

  const streaming = status === 'streaming';
  const confirmBlocked = stage.requireConfirm && !confirmed;
  const runDisabled = streaming || missingRequired || overCap || confirmBlocked;

  return (
    <section
      aria-label={`${stage.name} input`}
      className="flex h-full min-h-0 flex-col rounded-lg border border-border bg-surface"
    >
      <header className="border-b border-border px-4 py-2.5">
        <h2 className="flex items-center gap-2 text-sm font-semibold">
          <span className="flex h-5 w-5 items-center justify-center rounded bg-accent text-xs font-bold text-accent-fg">
            {stage.id}
          </span>
          {stage.name}
        </h2>
        <p className="mt-1 text-xs text-muted">{stage.tagline}</p>
      </header>

      <div className="min-h-0 flex-1 space-y-4 overflow-auto p-4">
        {stage.fields.map((field) => {
          const id = `field-${stage.key}-${field.name}`;
          return (
            <div key={field.name}>
              <label htmlFor={id} className="mb-1 block text-xs font-medium text-fg">
                {field.label}
                {field.required && <span className="ml-1 text-red-500" aria-hidden>*</span>}
              </label>
              {field.kind === 'textarea' ? (
                <textarea
                  id={id}
                  value={values[field.name] ?? ''}
                  onChange={(e) => onChange(field.name, e.target.value)}
                  placeholder={field.placeholder}
                  rows={field.pipeTarget ? 8 : 5}
                  className="w-full resize-y rounded-md border border-border bg-bg px-3 py-2 text-sm text-fg placeholder:text-muted focus:border-accent"
                />
              ) : (
                <input
                  id={id}
                  type="text"
                  value={values[field.name] ?? ''}
                  onChange={(e) => onChange(field.name, e.target.value)}
                  placeholder={field.placeholder}
                  className="w-full rounded-md border border-border bg-bg px-3 py-2 text-sm text-fg placeholder:text-muted focus:border-accent"
                />
              )}
              {field.help && <p className="mt-1 text-[11px] text-muted">{field.help}</p>}
            </div>
          );
        })}

        {/* Model toggle — only where the stage allows Opus. */}
        {stage.allowOpus ? (
          <fieldset>
            <legend className="mb-1.5 text-xs font-medium text-fg">Model</legend>
            <div className="flex gap-2" role="radiogroup" aria-label="Model">
              {(Object.keys(MODELS) as ModelId[]).map((m) => {
                const active = model === m;
                return (
                  <button
                    key={m}
                    type="button"
                    role="radio"
                    aria-checked={active}
                    onClick={() => onModelChange(m)}
                    className={[
                      'flex-1 rounded-md border px-3 py-2 text-left transition-colors',
                      active ? 'border-accent bg-accent/10' : 'border-border hover:bg-elevated',
                    ].join(' ')}
                  >
                    <span className="block text-sm font-medium text-fg">{MODELS[m].label}</span>
                    <span className="block text-[11px] text-muted">{MODELS[m].note}</span>
                  </button>
                );
              })}
            </div>
          </fieldset>
        ) : (
          <p className="text-[11px] text-muted">
            Model: <span className="font-medium text-fg">{MODELS['claude-sonnet-4-6'].label}</span> (fixed for this stage)
          </p>
        )}

        {/* Stage 4 confirm gate */}
        {stage.requireConfirm && (
          <label className="flex items-start gap-2 rounded-md border border-amber-300 bg-amber-50 p-3 text-xs text-amber-900 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-200">
            <input
              type="checkbox"
              checked={confirmed}
              onChange={(e) => setConfirmed(e.target.checked)}
              className="mt-0.5 h-4 w-4 shrink-0"
            />
            <span>
              Writing a full article consumes the most tokens. I confirm the blueprint above is the
              one I want written.
            </span>
          </label>
        )}
      </div>

      <footer className="border-t border-border px-4 py-3">
        <div className="mb-2 flex items-center justify-between text-[11px] text-muted">
          <span>
            {missingRequired ? 'Fill required fields to run.' : 'Ready.'}
          </span>
          <span className={overCap ? 'font-medium text-red-500' : ''}>
            {charCount.toLocaleString()} / {INPUT_CHAR_CAP.toLocaleString()}
          </span>
        </div>
        {streaming ? (
          <button
            type="button"
            onClick={onStop}
            className="w-full rounded-md border border-border bg-surface py-2.5 text-sm font-semibold text-fg hover:bg-elevated"
          >
            ■ Stop
          </button>
        ) : (
          <button
            type="button"
            onClick={onRun}
            disabled={runDisabled}
            className="w-full rounded-md bg-accent py-2.5 text-sm font-semibold text-accent-fg transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Run {stage.name}
          </button>
        )}
      </footer>
    </section>
  );
}
