import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/session';
import { listHistory } from '@/lib/usage';

export const runtime = 'nodejs';

export async function GET() {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const history = await listHistory(user);
  return NextResponse.json({ history });
}
