import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';
import { checkRateLimit, getClientIP } from '@/lib/rateLimit';

const execAsync = promisify(exec);

// ─── Security constants ───────────────────────────────────────────────────────
const MAX_CMD_LENGTH = 500;
const DEFAULT_CWD    = '/mnt/e/Hermes/hermes-dashboard';

/**
 * Allowed cwd roots — prevents path traversal to sensitive system dirs.
 * Only /mnt/ (WSL Windows mounts) and /home/ (WSL home) are permitted.
 */
const ALLOWED_CWD_PREFIXES = ['/mnt/', '/home/', '/tmp/'];

function validateCwd(cwd: unknown): string {
  if (typeof cwd !== 'string' || !cwd.startsWith('/')) return DEFAULT_CWD;
  const normalized = cwd.replace(/\/+$/, '') || '/';
  if (!ALLOWED_CWD_PREFIXES.some(p => normalized.startsWith(p))) return DEFAULT_CWD;
  return normalized;
}

/**
 * Patterns blocked for security. Targets injection vectors in the
 * `wsl.exe bash -c "..."` wrapper and catastrophic commands.
 */
const DANGEROUS_PATTERNS: RegExp[] = [
  // Fork bomb
  /:\(\)\s*\{.*\|.*&\s*\}/,
  // Disk/system destruction
  /rm\s+-[rf]{1,2}\s+[\/~]/i,
  /dd\s+if=\/dev\/(zero|random|urandom)\s+of=/i,
  />\s*\/dev\/(sd|hd|nvme|vd)[a-z]/i,
  /mkfs\./i,
  /format\s+[a-z]:/i,
  // Shutdown / reboot
  /\b(shutdown|reboot|halt|poweroff|init\s+0|init\s+6)\b/i,
  // Exfiltration via curl/wget to external hosts
  /\b(curl|wget)\s+.*https?:\/\/(?!localhost|127\.0\.0\.1|host\.docker\.internal)/i,
  // Null bytes
  /\x00/,
];

function sanitizeCommand(cmd: string): { ok: boolean; reason?: string } {
  if (cmd.length > MAX_CMD_LENGTH) {
    return { ok: false, reason: `Commande trop longue (max ${MAX_CMD_LENGTH} chars).` };
  }
  // Block control characters except tab (0x09) and newline (0x0a)
  // eslint-disable-next-line no-control-regex
  if (/[\x01-\x08\x0b\x0c\x0e-\x1f\x7f]/.test(cmd)) {
    return { ok: false, reason: 'Caracteres de controle non autorises.' };
  }
  for (const pattern of DANGEROUS_PATTERNS) {
    if (pattern.test(cmd)) {
      return { ok: false, reason: '[BLOQUE] Commande bloquee par politique de securite.' };
    }
  }
  return { ok: true };
}

export async function POST(req: NextRequest) {
  // ── 1. Rate limiting: 20 req/min per IP ──────────────────────────────────
  const ip = getClientIP(req);
  const rl = checkRateLimit(`terminal:${ip}`);
  if (!rl.allowed) {
    return NextResponse.json(
      { stderr: '[LIMITE] Trop de requetes. Reessaie dans 1 minute.', stdout: '' },
      {
        status: 429,
        headers: {
          'Retry-After': String(Math.ceil(rl.resetIn / 1000)),
          'X-RateLimit-Remaining': '0',
        },
      }
    );
  }

  try {
    const body    = await req.json() as { command?: unknown; cwd?: unknown };
    const command = body.command;
    const cwd     = validateCwd(body.cwd);

    if (!command || typeof command !== 'string') {
      return NextResponse.json({ error: 'Commande invalide.' }, { status: 400 });
    }

    // ── 3. Sanitization ───────────────────────────────────────────────────
    const check = sanitizeCommand(command.trim());
    if (!check.ok) {
      return NextResponse.json({ stderr: check.reason, stdout: '' }, { status: 400 });
    }

    const cleanCmd  = command.trim();
    const isWindows = process.platform === 'win32';

    // Build the full command with cwd baked in (handles stateless exec).
    // We use `cd <cwd> 2>/dev/null; <cmd>` so the command always runs in
    // the right directory even if the shell spawns fresh each call.
    const cwdPrefix        = `cd ${JSON.stringify(cwd)} 2>/dev/null && `;
    const cmdWithCwd       = `${cwdPrefix}${cleanCmd}`;
    const escapedForWrapper = cmdWithCwd.replace(/\\/g, '\\\\').replace(/"/g, '\\"');

    try {
      const fullCmd = isWindows
        ? `wsl.exe bash -c "${escapedForWrapper}"`
        : cmdWithCwd;

      const { stdout, stderr } = await execAsync(fullCmd, {
        timeout:   30_000,
        maxBuffer: 1024 * 1024,
        cwd:       isWindows ? undefined : cwd,
        shell:     isWindows ? undefined : '/bin/bash',
        env:       { ...process.env, TERM: 'xterm-256color' },
      });

      return NextResponse.json(
        { stdout: stdout || '', stderr: stderr || '' },
        { headers: { 'X-RateLimit-Remaining': String(rl.remaining) } }
      );

    } catch (wslErr) {
      // Fallback to PowerShell if WSL2 is not available
      if (isWindows) {
        try {
          const escapedForPS = cleanCmd.replace(/"/g, '\\"');
          const { stdout, stderr } = await execAsync(
            `powershell -Command "${escapedForPS}"`,
            { timeout: 30_000, maxBuffer: 1024 * 1024 }
          );
          return NextResponse.json({ stdout: stdout || '', stderr: stderr || '' });
        } catch (psErr) {
          const msg = psErr instanceof Error ? psErr.message : String(psErr);
          return NextResponse.json({ stdout: '', stderr: msg });
        }
      }
      const msg = wslErr instanceof Error ? wslErr.message : String(wslErr);
      return NextResponse.json({ stdout: '', stderr: msg });
    }

  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erreur inconnue';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
