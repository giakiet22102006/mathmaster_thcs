import { NextRequest, NextResponse } from 'next/server';
import { readServerStateAsync, writeServerStateAsync } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  const state = await readServerStateAsync();
  return NextResponse.json({ ok: true, state });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (body && body.state) {
      await writeServerStateAsync(body.state);
      return NextResponse.json({ ok: true, savedAt: new Date().toISOString() });
    }
    return NextResponse.json({ ok: false, error: 'Missing state payload' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err?.message || 'Invalid JSON' }, { status: 500 });
  }
}
