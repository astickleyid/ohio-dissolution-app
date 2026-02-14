import { NextRequest, NextResponse } from 'next/server';
import { kv } from '@vercel/kv';

// POST /api/autosave — saves form state, returns saved_at timestamp
export async function POST(req: NextRequest) {
  try {
    const { caseId, data } = await req.json();
    if (!caseId) return NextResponse.json({ error: 'caseId required' }, { status: 400 });

    const key = `case:${caseId}`;
    const saved_at = new Date().toISOString();

    await kv.set(key, { ...data, _saved_at: saved_at });

    return NextResponse.json({ success: true, saved_at });
  } catch (err) {
    console.error('Autosave error:', err);
    return NextResponse.json({ error: 'Save failed' }, { status: 500 });
  }
}

// GET /api/autosave?caseId=becca-nicole — loads saved state
export async function GET(req: NextRequest) {
  try {
    const caseId = req.nextUrl.searchParams.get('caseId');
    if (!caseId) return NextResponse.json({ error: 'caseId required' }, { status: 400 });

    const key = `case:${caseId}`;
    const data = await kv.get(key);

    if (!data) return NextResponse.json({ found: false });
    return NextResponse.json({ found: true, data });
  } catch (err) {
    console.error('Autosave load error:', err);
    return NextResponse.json({ error: 'Load failed' }, { status: 500 });
  }
}
