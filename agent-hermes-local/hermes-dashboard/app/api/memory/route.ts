import { NextRequest, NextResponse } from 'next/server';
import { loadUserMemory } from '@/lib/memory';

export async function GET(_req: NextRequest) {
  try {
    const memory = loadUserMemory();
    return NextResponse.json({ memory });
  } catch (err) {
    console.error('GET /api/memory error:', err);
    return NextResponse.json({ error: 'Erreur de lecture de la memoire.' }, { status: 500 });
  }
}
