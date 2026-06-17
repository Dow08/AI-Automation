/**
 * /api/refresh — cache freshness check
 *
 * Returns the age of each cache file so the UI can show
 * "stale" warnings.  Actual data refresh is done by the
 * Cowork scheduled task (scripts/refresh-cache.mjs) or
 * manually from a Cowork session.
 */
import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data');

function cacheInfo(filename: string) {
  const filePath = path.join(DATA_DIR, filename);
  if (!fs.existsSync(filePath)) return { exists: false, ageMinutes: null, cachedAt: null };

  try {
    const raw  = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    const stat = fs.statSync(filePath);
    const cachedAt   = raw.cachedAt || stat.mtime.toISOString();
    const ageMinutes = Math.round((Date.now() - new Date(cachedAt).getTime()) / 60000);
    return { exists: true, ageMinutes, cachedAt, stale: ageMinutes > 60 };
  } catch {
    return { exists: true, ageMinutes: null, cachedAt: null, stale: true };
  }
}

export async function GET() {
  return NextResponse.json({
    gmail:    cacheInfo('gmail-cache.json'),
    calendar: cacheInfo('calendar-cache.json'),
    drive:    cacheInfo('drive-cache.json'),
    hint:     'Run the Cowork refresh task to update stale caches.',
  }, { headers: { 'Cache-Control': 'no-store' } });
}
