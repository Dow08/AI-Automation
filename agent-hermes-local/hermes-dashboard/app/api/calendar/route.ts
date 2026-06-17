import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const CACHE_PATH = path.join(process.cwd(), 'data', 'calendar-cache.json');

export async function GET() {
  try {
    if (!fs.existsSync(CACHE_PATH)) {
      return NextResponse.json({ error: 'Cache not found' }, { status: 404 });
    }
    const raw = fs.readFileSync(CACHE_PATH, 'utf-8');
    const data = JSON.parse(raw);
    return NextResponse.json(data, {
      headers: { 'Cache-Control': 'no-store' },
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
