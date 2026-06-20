'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import ThemeToggle from '@/components/ThemeToggle';

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const from = params.get('from') || '/';

  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      });
      if (res.ok) {
        router.replace(from.startsWith('/') ? from : '/');
        router.refresh();
        return;
      }
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      setError(data.error ?? 'Login failed.');
    } catch {
      setError('Network error. Try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={submit}
      className="w-full max-w-sm rounded-xl border border-border bg-surface p-6 shadow-sm"
    >
      <h1 className="text-lg font-semibold">Semantic SEO Studio</h1>
      <p className="mt-1 text-sm text-muted">Enter your access code to continue.</p>

      <label htmlFor="code" className="mt-5 mb-1 block text-xs font-medium">
        Access code
      </label>
      <input
        id="code"
        type="password"
        autoComplete="current-password"
        value={code}
        onChange={(e) => setCode(e.target.value)}
        autoFocus
        className="w-full rounded-md border border-border bg-bg px-3 py-2 text-sm text-fg focus:border-accent"
        placeholder="••••••••"
      />

      {error && (
        <p role="alert" className="mt-2 text-xs text-red-600 dark:text-red-400">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={loading || !code}
        className="mt-4 w-full rounded-md bg-accent py-2.5 text-sm font-semibold text-accent-fg transition-opacity hover:opacity-90 disabled:opacity-40"
      >
        {loading ? 'Checking…' : 'Enter'}
      </button>
    </form>
  );
}

export default function LoginPage() {
  return (
    <div className="relative flex min-h-dvh items-center justify-center px-4">
      <div className="absolute right-4 top-4">
        <ThemeToggle />
      </div>
      <Suspense fallback={<div className="text-sm text-muted">Loading…</div>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
