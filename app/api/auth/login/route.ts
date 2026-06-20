import { NextResponse } from 'next/server';
import { cookieMaxAge, createSessionToken, randomSubject, SESSION_COOKIE } from '@/lib/auth';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  const expected = process.env.ACCESS_CODE;
  if (!expected) {
    return NextResponse.json(
      { error: 'Server is missing ACCESS_CODE configuration.' },
      { status: 500 }
    );
  }

  let code = '';
  try {
    const body = (await req.json()) as { code?: unknown };
    code = typeof body.code === 'string' ? body.code : '';
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
  }

  // Constant-time-ish comparison; lengths differ rarely, content compared fully.
  const a = new TextEncoder().encode(code);
  const b = new TextEncoder().encode(expected);
  let equal = a.length === b.length;
  const len = Math.max(a.length, b.length);
  for (let i = 0; i < len; i++) equal = equal && a[i % a.length] === b[i % b.length];
  if (!equal || code.length !== expected.length) {
    return NextResponse.json({ error: 'Incorrect access code.' }, { status: 401 });
  }

  const token = await createSessionToken(randomSubject());
  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: cookieMaxAge,
  });
  return res;
}
