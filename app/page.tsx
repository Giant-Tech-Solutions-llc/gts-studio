'use client';

import { useCallback, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  composeInput,
  DEFAULT_MODEL,
  getStage,
  type ModelId,
  STAGES,
} from '@/lib/stages';
import { ERROR_MARKER } from '@/lib/output';
import ModeRail from '@/components/ModeRail';
import InputForm from '@/components/InputForm';
import OutputPane, { type RunStatus } from '@/components/OutputPane';
import HistoryPanel, { type HistoryEntry } from '@/components/HistoryPanel';
import ThemeToggle from '@/components/ThemeToggle';

type ValuesByStage = Record<number, Record<string, string>>;
type MobilePane = 'input' | 'output';

export default function Home() {
  const router = useRouter();

  const [mode, setMode] = useState<number>(0);
  const [valuesByStage, setValuesByStage] = useState<ValuesByStage>({});
  const [model, setModel] = useState<ModelId>(DEFAULT_MODEL);

  const [status, setStatus] = useState<RunStatus>('idle');
  const [output, setOutput] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [modelUsed, setModelUsed] = useState<ModelId | null>(null);
  const [historyKey, setHistoryKey] = useState(0);
  const [mobilePane, setMobilePane] = useState<MobilePane>('input');

  const abortRef = useRef<AbortController | null>(null);
  const stage = getStage(mode) ?? STAGES[0];
  const values = useMemo(() => valuesByStage[mode] ?? {}, [valuesByStage, mode]);

  const setFieldValue = useCallback(
    (name: string, value: string) => {
      setValuesByStage((prev) => ({
        ...prev,
        [mode]: { ...(prev[mode] ?? {}), [name]: value },
      }));
    },
    [mode]
  );

  const selectMode = useCallback((id: number) => {
    setMode(id);
    setStatus('idle');
    setOutput('');
    setErrorMessage(null);
    setModelUsed(null);
    const s = getStage(id);
    if (!s?.allowOpus) setModel(DEFAULT_MODEL);
  }, []);

  const stop = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    setStatus((s) => (s === 'streaming' ? 'done' : s));
  }, []);

  const run = useCallback(async () => {
    const input = composeInput(stage, values);
    if (!input.trim()) return;

    const controller = new AbortController();
    abortRef.current = controller;
    setStatus('streaming');
    setOutput('');
    setErrorMessage(null);
    setModelUsed(null);

    try {
      const res = await fetch('/api/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode, input, model }),
        signal: controller.signal,
      });

      if (res.status === 401) {
        router.push('/login?from=/');
        return;
      }

      if (!res.ok || !res.body) {
        let msg = 'The run failed.';
        try {
          const data = (await res.json()) as { error?: string };
          if (data.error) msg = data.error;
        } catch {
          /* ignore */
        }
        if (res.status === 429) {
          const retry = res.headers.get('Retry-After');
          if (retry) msg = `Rate limit reached. Retry in ${retry}s.`;
        }
        setErrorMessage(msg);
        setStatus('error');
        return;
      }

      setModelUsed((res.headers.get('X-Model') as ModelId) ?? model);

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let acc = '';
      // eslint-disable-next-line no-constant-condition
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        acc += decoder.decode(value, { stream: true });
        setOutput(acc);
      }

      if (acc.includes(ERROR_MARKER)) {
        setStatus('error');
      } else {
        setStatus('done');
        setHistoryKey((k) => k + 1);
      }
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') {
        setStatus('done');
        return;
      }
      setErrorMessage('Network error. Check your connection and try again.');
      setStatus('error');
    } finally {
      abortRef.current = null;
    }
  }, [stage, values, mode, model, router]);

  const sendToNext = useCallback((targetStageId: number, out: string) => {
    const target = getStage(targetStageId);
    if (!target) return;
    const pipeField = target.fields.find((f) => f.pipeTarget) ?? target.fields[0];
    setValuesByStage((prev) => ({
      ...prev,
      [targetStageId]: { ...(prev[targetStageId] ?? {}), [pipeField.name]: out },
    }));
    setMode(targetStageId);
    setStatus('idle');
    setOutput('');
    setErrorMessage(null);
    setModelUsed(null);
    if (!target.allowOpus) setModel(DEFAULT_MODEL);
    setMobilePane('input');
  }, []);

  const loadHistory = useCallback((entry: HistoryEntry) => {
    const s = getStage(entry.mode);
    if (!s) return;
    // Reconstruct: drop the entry's output into the output pane, and put the
    // raw input into the first field so it can be re-run or edited.
    setMode(entry.mode);
    setValuesByStage((prev) => ({
      ...prev,
      [entry.mode]: { ...(prev[entry.mode] ?? {}), [s.fields[0].name]: entry.input },
    }));
    setOutput(entry.output);
    setStatus('done');
    setErrorMessage(null);
    setModelUsed((entry.model as ModelId) ?? null);
    setMobilePane('output');
  }, []);

  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  }

  return (
    <div className="flex h-dvh flex-col">
      {/* Header */}
      <header className="flex h-14 shrink-0 items-center justify-between border-b border-border px-4">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-md bg-accent text-sm font-bold text-accent-fg">
            S
          </span>
          <h1 className="text-sm font-semibold">Semantic SEO Studio</h1>
          <span className="hidden text-xs text-muted sm:inline">· topical authority pipeline</span>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <button
            type="button"
            onClick={logout}
            className="rounded-md border border-border bg-surface px-3 py-1.5 text-xs font-medium text-fg hover:bg-elevated"
          >
            Sign out
          </button>
        </div>
      </header>

      {/* Mobile pane switcher */}
      <div className="flex shrink-0 gap-1 border-b border-border p-2 lg:hidden">
        {(['input', 'output'] as MobilePane[]).map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => setMobilePane(p)}
            aria-pressed={mobilePane === p}
            className={[
              'flex-1 rounded-md py-1.5 text-xs font-medium capitalize',
              mobilePane === p ? 'bg-accent text-accent-fg' : 'bg-surface text-fg',
            ].join(' ')}
          >
            {p}
          </button>
        ))}
      </div>

      {/* Three-pane layout */}
      <main className="grid min-h-0 flex-1 grid-cols-1 gap-3 p-3 lg:grid-cols-[230px_minmax(0,1fr)_minmax(0,1.2fr)]">
        {/* Left rail */}
        <aside className="hidden min-h-0 flex-col overflow-auto rounded-lg border border-border bg-surface p-2 lg:flex">
          <ModeRail selected={mode} onSelect={selectMode} />
          <HistoryPanel refreshKey={historyKey} onLoad={loadHistory} />
        </aside>

        {/* Mobile rail (compact, above input) */}
        <div className="overflow-x-auto rounded-lg border border-border bg-surface p-2 lg:hidden">
          <ModeRail selected={mode} onSelect={(id) => { selectMode(id); }} />
          <HistoryPanel refreshKey={historyKey} onLoad={loadHistory} />
        </div>

        {/* Center: input */}
        <div className={['min-h-0', mobilePane === 'input' ? 'flex' : 'hidden', 'lg:flex'].join(' ')}>
          <div className="h-full w-full">
            <InputForm
              stage={stage}
              values={values}
              onChange={setFieldValue}
              model={model}
              onModelChange={setModel}
              status={status}
              onRun={run}
              onStop={stop}
            />
          </div>
        </div>

        {/* Right: output */}
        <div className={['min-h-0', mobilePane === 'output' ? 'flex' : 'hidden', 'lg:flex'].join(' ')}>
          <div className="h-full w-full">
            <OutputPane
              stage={stage}
              status={status}
              text={output}
              errorMessage={errorMessage}
              modelUsed={modelUsed}
              onStop={stop}
              onSendToNext={sendToNext}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
