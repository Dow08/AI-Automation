import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { requireAuth } from '@/lib/auth';

const MEMORY_PATH = process.env.HERMES_MEMORY_PATH || 'E:/Memoire_IA/data';

/** Convert Windows drive paths (E:/foo) to WSL2 mount paths (/mnt/e/foo) on Linux */
function normalizePath(p: string): string {
  if (process.platform !== 'win32') {
    const m = p.match(/^([A-Za-z]):[\\\/](.*)$/);
    if (m) return `/mnt/${m[1].toLowerCase()}/${m[2].replace(/\\/g, '/')}`;
  }
  return p;
}

/**
 * Valide que l'ID d'une conversation importée est safe pour être utilisé comme nom de fichier.
 * Accepte uniquement les UUIDs v4 et les identifiants alphanumériques courts.
 */
function isSafeConvId(id: unknown): id is string {
  return typeof id === 'string' && /^[a-zA-Z0-9_-]{1,64}$/.test(id);
}

/**
 * Vérifie que le chemin résolu reste dans le répertoire de base.
 */
function assertWithinDir(resolvedPath: string, baseDir: string): void {
  const normalizedBase = path.resolve(baseDir);
  const normalizedTarget = path.resolve(resolvedPath);
  if (!normalizedTarget.startsWith(normalizedBase + path.sep) &&
      normalizedTarget !== normalizedBase) {
    throw new Error('Accès refusé : chemin hors du répertoire autorisé.');
  }
}

function writeConversation(convsDir: string, conv: { id?: string; [key: string]: unknown }): boolean {
  if (!isSafeConvId(conv.id)) return false; // Skip les IDs dangereux silencieusement
  const filePath = path.join(convsDir, `${conv.id}.json`);
  assertWithinDir(filePath, convsDir); // double-vérification
  fs.writeFileSync(filePath, JSON.stringify(conv, null, 2), 'utf-8');
  return true;
}

export async function POST(req: NextRequest) {
  // ── Authentification ──────────────────────────────────────────────────────
  const authError = requireAuth(req);
  if (authError) return authError;

  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const type = formData.get('type') as string | null; // 'profile' | 'conversations'

    if (!file) {
      return NextResponse.json({ error: 'Aucun fichier fourni.' }, { status: 400 });
    }

    // Limite de taille : 10 MB pour l'import
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: 'Fichier trop volumineux (max 10 MB).' }, { status: 413 });
    }

    const text = await file.text();
    let parsed: unknown;

    try {
      parsed = JSON.parse(text);
    } catch {
      return NextResponse.json({ error: 'Fichier JSON invalide.' }, { status: 400 });
    }

    const dataDir = normalizePath(MEMORY_PATH);
    if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

    if (type === 'profile') {
      // Import user memory profile — écrit dans un fichier fixe, pas de traversal possible
      const profilePath = path.join(dataDir, 'user_profile.json');
      fs.writeFileSync(profilePath, JSON.stringify(parsed, null, 2), 'utf-8');
      return NextResponse.json({ success: true, message: 'Profil memoire importe avec succes.' });

    } else if (type === 'conversations') {
      const convsDir = path.join(dataDir, 'conversations');
      if (!fs.existsSync(convsDir)) fs.mkdirSync(convsDir, { recursive: true });

      const items = Array.isArray(parsed) ? parsed : [parsed];
      let count = 0;
      for (const item of items) {
        const conv = item as { id?: string };
        if (writeConversation(convsDir, conv)) count++;
      }
      return NextResponse.json({ success: true, message: `${count} conversation(s) importee(s).` });

    } else {
      // Auto-detect by structure
      if (typeof parsed === 'object' && parsed !== null && 'profile' in parsed) {
        const profilePath = path.join(dataDir, 'user_profile.json');
        fs.writeFileSync(profilePath, JSON.stringify(parsed, null, 2), 'utf-8');
        return NextResponse.json({ success: true, message: 'Profil memoire importe automatiquement.' });
      }
      if (Array.isArray(parsed)) {
        const convsDir = path.join(dataDir, 'conversations');
        if (!fs.existsSync(convsDir)) fs.mkdirSync(convsDir, { recursive: true });
        let count = 0;
        for (const item of parsed) {
          const conv = item as { id?: string };
          if (writeConversation(convsDir, conv)) count++;
        }
        return NextResponse.json({ success: true, message: `${count} conversation(s) importee(s).` });
      }
      return NextResponse.json({ error: 'Type de fichier non reconnu.' }, { status: 400 });
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erreur inconnue';
    console.error('POST /api/memory/import error:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
