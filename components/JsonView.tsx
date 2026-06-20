'use client';

import { useState } from 'react';

type Json = null | boolean | number | string | Json[] | { [k: string]: Json };

function ValueLeaf({ value }: { value: Exclude<Json, Json[] | object> }) {
  let cls = 'text-fg';
  let text: string;
  if (value === null) {
    cls = 'text-muted italic';
    text = 'null';
  } else if (typeof value === 'string') {
    cls = 'text-emerald-600 dark:text-emerald-400';
    text = `"${value}"`;
  } else if (typeof value === 'number') {
    cls = 'text-sky-600 dark:text-sky-400';
    text = String(value);
  } else {
    cls = 'text-purple-600 dark:text-purple-400';
    text = String(value);
  }
  return <span className={cls}>{text}</span>;
}

function Node({
  value,
  name,
  depth,
  isLast,
}: {
  value: Json;
  name?: string;
  depth: number;
  isLast: boolean;
}) {
  const [open, setOpen] = useState(depth < 2);
  const isArray = Array.isArray(value);
  const isObject = value !== null && typeof value === 'object';

  const keyLabel = name !== undefined ? (
    <span className="text-amber-700 dark:text-amber-300">&quot;{name}&quot;</span>
  ) : null;
  const colon = name !== undefined ? <span className="text-muted">: </span> : null;
  const comma = !isLast ? <span className="text-muted">,</span> : null;

  if (!isObject) {
    return (
      <div className="whitespace-pre-wrap break-words pl-[var(--indent)]" style={{ ['--indent' as string]: `${depth * 1.1}rem` }}>
        {keyLabel}
        {colon}
        <ValueLeaf value={value as Exclude<Json, Json[] | object>} />
        {comma}
      </div>
    );
  }

  const entries: [string | number, Json][] = isArray
    ? (value as Json[]).map((v, i) => [i, v])
    : Object.entries(value as { [k: string]: Json });
  const openBrace = isArray ? '[' : '{';
  const closeBrace = isArray ? ']' : '}';
  const count = entries.length;

  return (
    <div className="pl-[var(--indent)]" style={{ ['--indent' as string]: `${depth * 1.1}rem` }}>
      <div className="flex items-start">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          className="mr-1 inline-flex h-4 w-4 shrink-0 select-none items-center justify-center rounded text-muted hover:bg-elevated"
          title={open ? 'Collapse' : 'Expand'}
        >
          <span aria-hidden>{open ? '▾' : '▸'}</span>
        </button>
        <span>
          {keyLabel}
          {colon}
          <span className="text-muted">{openBrace}</span>
          {!open && (
            <>
              <span className="text-muted"> {count} {count === 1 ? 'item' : 'items'} </span>
              <span className="text-muted">{closeBrace}</span>
              {comma}
            </>
          )}
        </span>
      </div>
      {open && (
        <>
          {entries.map(([k, v], i) => (
            <Node
              key={String(k)}
              name={isArray ? undefined : String(k)}
              value={v}
              depth={depth + 1}
              isLast={i === entries.length - 1}
            />
          ))}
          <div className="pl-[var(--indent)]" style={{ ['--indent' as string]: `${depth * 1.1}rem` }}>
            <span className="text-muted">{closeBrace}</span>
            {comma}
          </div>
        </>
      )}
    </div>
  );
}

export default function JsonView({ data }: { data: Json }) {
  return (
    <div className="font-mono text-[13px] leading-relaxed">
      <Node value={data} depth={0} isLast />
    </div>
  );
}
