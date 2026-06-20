import 'server-only';
import { cookies } from 'next/headers';
import { SESSION_COOKIE, verifySessionToken } from './auth';

/** Returns the session subject (random per-login id) or null if unauthenticated. */
export async function getSessionUser(): Promise<string | null> {
  const token = cookies().get(SESSION_COOKIE)?.value;
  const session = await verifySessionToken(token);
  return session?.sub ?? null;
}
