'use client';

import { useCallback, useEffect, useState } from 'react';
import { getStage } from '@/lib/stages';

export interface HistoryEntry {
  id: string;
  mode: number;
  model: string;
  input: string;
  output: string;
  ts: number;
}

interface Props {
  refreshKey: number;
  onLoad: (entry: HistoryEntry) => void;
}

export default function HistoryPanel({ refreshKey, onLoad }: Props) {
  const [open, setOpen] = useState(false);
  const [entries, setEntries] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [unavailable, setUnavailable] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/history', { cache: 'no-store' });
      if (!res.ok) throw new Error('failed');
      const data = (await res.json()) as { history: HistoryEntry[] };
      setEntries(data.history ?? []);
      setUnavailable((data.history ?? []).length === 0 && false);
    } catch {
      setUnavailable(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (open) void load();
  }, [open, load, refreshKey]);

  return (
    <div className="mt-3 border-t border-border pt-3">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex w-full items-center justify-between rounded-md px-2 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted hover:bg-elevated"
      >
        <span>Run history</span>
        <span aria-hidden>{open ? '▾' : '▸'}</span>
      </button>

      {open && (
        <div className="mt-1.5 space-y-1">
          {loading && <p className="px-2 py-1 text-xs text-muted">Loading…</p>}
          {!loading && entries.length === 0 && (
            <p className="px-2 py-1 text-xs text-muted">
              {unavailable ? 'History store not configured.' : 'No runs yet.'}
            </p>
          )}
          {entries.map((e) => {
            const stage = getStage(e.mode);
            return (
              <button
                key={e.id}
                type="button"
                onClick={() => onLoad(e)}
                className="block w-full rounded-md border border-transparent px-2 py-1.5 text-left hover:border-border hover:bg-elevated"
              >
                <span className="block truncate text-xs font-medium text-fg">
                  {stage ? `${stage.id}. ${stage.name}` : `Stage ${e.mode}`}
                </span>
                <span className="block truncate text-[11px] text-muted">
                  {new Date(e.ts).toLocaleString()} · {e.input.slice(0, 48)}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
