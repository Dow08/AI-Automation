import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { requireAuth } from '@/lib/auth';

const MEMORY_PATH = process.env.HERMES_MEMORY_PATH || 'E:/Memoire_IA/data';

// Day labels Mon->Sun (index 0 = Monday to match dashboard L M M J V S D)
const DAY_LABELS = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];

/** Convert Windows drive paths to WSL2 mount paths on Linux */
function normalizePath(p: string): string {
  if (process.platform !== 'win32') {
    const m = p.match(/^([A-Za-z]):[/\\](.*)$/);
    if (m) return `/mnt/${m[1].toLowerCase()}/${m[2].replace(/\\/g, '/')}`;
  }
  return p;
}

export async function GET(req: NextRequest) {
  const authError = requireAuth(req);
  if (authError) return authError;

  try {
    const memPath = normalizePath(MEMORY_PATH);

    if (!fs.existsSync(memPath)) {
      return NextResponse.json({
        count: 0, sizeBytes: 0, sizeMB: 0, exists: false,
        dailyCounts: [0, 0, 0, 0, 0, 0, 0], score: 0,
        totalMessages: 0, percent: 0, dayLabels: DAY_LABELS,
      });
    }

    const files = fs.readdirSync(memPath).filter(f => f.endsWith('.json'));
    let totalBytes = 0;

    const now    = new Date();
    const cutoff = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

    const dailyCounts = [0, 0, 0, 0, 0, 0, 0];
    let totalMessages = 0;

    for (const file of files) {
      const filePath = path.join(memPath, file);
      try {
        const stat = fs.statSync(filePath);
        totalBytes += stat.size;

        if (stat.mtime >= cutoff) {
          const dayJs  = stat.mtime.getDay();
          const dayIdx = dayJs === 0 ? 6 : dayJs - 1;
          dailyCounts[dayIdx]++;
          totalMessages++;

          try {
            const raw  = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
            const msgs = (raw.messages?.length ?? 1) as number;
            dailyCounts[dayIdx] += Math.max(0, msgs - 1);
            totalMessages       += Math.max(0, msgs - 1);
          } catch (_e) { /* use file count */ }
        }
      } catch (_e) { /* skip */ }
    }

    const last7  = dailyCounts.reduce((a, b) => a + b, 0);
    const maxAct = 7 * 20;
    const score  = Math.min(100, Math.round((last7 / maxAct) * 100));

    const sizeMB  = totalBytes / (1024 * 1024);
    const maxMB   = 500;
    const percent = Math.min(Math.round((sizeMB / maxMB) * 100), 100);

    return NextResponse.json({
      count:        files.length,
      sizeBytes:    totalBytes,
      sizeMB:       Math.round(sizeMB * 100) / 100,
      percent,
      path:         MEMORY_PATH,
      exists:       true,
      dailyCounts,
      dayLabels:    DAY_LABELS,
      score,
      totalMessages,
    }, { headers: { 'Cache-Control': 'no-store' } });

  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
