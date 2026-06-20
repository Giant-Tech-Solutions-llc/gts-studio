'use client';

import { STAGES } from '@/lib/stages';

interface Props {
  selected: number;
  onSelect: (id: number) => void;
}

export default function ModeRail({ selected, onSelect }: Props) {
  return (
    <nav aria-label="Pipeline stages" className="flex flex-col gap-1">
      <p className="px-2 pb-1 text-[11px] font-semibold uppercase tracking-wide text-muted">
        Pipeline
      </p>
      <ul className="flex flex-col gap-1" role="list">
        {STAGES.map((stage) => {
          const active = stage.id === selected;
          return (
            <li key={stage.id}>
              <button
                type="button"
                aria-current={active ? 'true' : undefined}
                onClick={() => onSelect(stage.id)}
                className={[
                  'group flex w-full items-start gap-2.5 rounded-md border px-2.5 py-2 text-left transition-colors',
                  active
                    ? 'border-accent bg-accent/10'
                    : 'border-transparent hover:border-border hover:bg-elevated',
                ].join(' ')}
              >
                <span
                  className={[
                    'mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded text-xs font-bold',
                    active ? 'bg-accent text-accent-fg' : 'bg-elevated text-muted',
                  ].join(' ')}
                  aria-hidden
                >
                  {stage.id}
                </span>
                <span className="min-w-0">
                  <span className={['block text-sm font-medium', active ? 'text-fg' : 'text-fg/90'].join(' ')}>
                    {stage.name}
                  </span>
                  <span className="block text-[11px] leading-snug text-muted">{stage.tagline}</span>
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
