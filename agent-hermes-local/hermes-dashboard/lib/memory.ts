import fs from 'fs';
import path from 'path';
import type { Conversation, ConversationSummary, UserMemory } from '@/types';

const MEMORY_PATH = process.env.HERMES_MEMORY_PATH || 'E:/Memoire_IA/data';

/** Normalise les chemins Windows (E:/foo) vers les paths WSL2 (/mnt/e/foo) sur Linux */
function normalizeBasePath(p: string): string {
  if (process.platform !== 'win32') {
    const m = p.match(/^([A-Za-z]):[\\\/](.*)$/);
    if (m) return `/mnt/${m[1].toLowerCase()}/${m[2].replace(/\\/g, '/')}`;
  }
  return p;
}

/**
 * Valide qu'un ID de conversation ne contient pas de séquences de traversal.
 * Accepte uniquement les UUIDs v4 (format standard) et les IDs alphanumériques courts.
 * Lève une Error si l'ID est invalide.
 */
function validateConversationId(id: string): void {
  if (!id || typeof id !== 'string') throw new Error('ID de conversation invalide.');
  // UUID v4 standard ou alphanumérique avec tirets (max 64 chars)
  if (!/^[a-zA-Z0-9_-]{1,64}$/.test(id)) {
    throw new Error(`ID de conversation non autorisé : "${id}"`);
  }
}

/**
 * Vérifie que le chemin résolu reste bien dans le répertoire de base autorisé.
 * Protection contre les path traversal via id contenant "../".
 */
function assertWithinDir(resolvedPath: string, baseDir: string): void {
  const normalizedBase = path.resolve(baseDir);
  const normalizedTarget = path.resolve(resolvedPath);
  if (!normalizedTarget.startsWith(normalizedBase + path.sep) &&
      normalizedTarget !== normalizedBase) {
    throw new Error(`Accès refusé : chemin hors du répertoire autorisé.`);
  }
}

function getConversationsDir(): string {
  const base = normalizeBasePath(MEMORY_PATH);
  const dir = path.join(base, 'conversations');
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  return dir;
}

function getMemoryProfilePath(): string {
  const base = normalizeBasePath(MEMORY_PATH);
  if (!fs.existsSync(base)) {
    fs.mkdirSync(base, { recursive: true });
  }
  return path.join(base, 'user_profile.json');
}

export function saveConversation(conversation: Conversation): void {
  validateConversationId(conversation.id);
  const dir = getConversationsDir();
  const filePath = path.join(dir, `${conversation.id}.json`);
  assertWithinDir(filePath, dir);
  fs.writeFileSync(filePath, JSON.stringify(conversation, null, 2), 'utf-8');
}

export function loadConversation(id: string): Conversation | null {
  validateConversationId(id);
  const dir = getConversationsDir();
  const filePath = path.join(dir, `${id}.json`);
  assertWithinDir(filePath, dir);
  if (!fs.existsSync(filePath)) return null;
  const raw = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(raw) as Conversation;
}

export function deleteConversation(id: string): boolean {
  validateConversationId(id);
  const dir = getConversationsDir();
  const filePath = path.join(dir, `${id}.json`);
  assertWithinDir(filePath, dir);
  if (!fs.existsSync(filePath)) return false;
  fs.unlinkSync(filePath);
  return true;
}

export function listConversations(): ConversationSummary[] {
  const dir = getConversationsDir();
  const files = fs.readdirSync(dir).filter((f) => f.endsWith('.json'));

  const summaries: ConversationSummary[] = files
    .map((file) => {
      try {
        const raw = fs.readFileSync(path.join(dir, file), 'utf-8');
        const conv = JSON.parse(raw) as Conversation;
        const firstUserMsg = conv.messages.find((m) => m.role === 'user');
        return {
          id: conv.id,
          title: conv.title || 'Conversation sans titre',
          preview: firstUserMsg?.content?.slice(0, 100) || '',
          model: conv.model,
          messageCount: conv.messages.length,
          createdAt: conv.createdAt,
          updatedAt: conv.updatedAt,
        } as ConversationSummary;
      } catch {
        return null;
      }
    })
    .filter(Boolean) as ConversationSummary[];

  return summaries.sort((a, b) => b.updatedAt - a.updatedAt);
}

export function deleteAllConversations(): number {
  const dir = getConversationsDir();
  const files = fs.readdirSync(dir).filter((f) => f.endsWith('.json'));
  files.forEach((f) => fs.unlinkSync(path.join(dir, f)));
  return files.length;
}

export function loadUserMemory(): UserMemory {
  const profilePath = getMemoryProfilePath();
  if (!fs.existsSync(profilePath)) {
    return { profile: {}, preferences: {}, lastUpdated: Date.now() };
  }
  try {
    const raw = fs.readFileSync(profilePath, 'utf-8');
    return JSON.parse(raw) as UserMemory;
  } catch {
    return { profile: {}, preferences: {}, lastUpdated: Date.now() };
  }
}

export function updateUserMemory(updates: Partial<UserMemory>): void {
  const profilePath = getMemoryProfilePath();
  const current = loadUserMemory();
  const updated: UserMemory = {
    ...current,
    ...updates,
    lastUpdated: Date.now(),
  };
  fs.writeFileSync(profilePath, JSON.stringify(updated, null, 2), 'utf-8');
}

export function getRecentConversationsContext(limit = 3): string {
  const convs = listConversations().slice(0, limit);
  if (convs.length === 0) return '';

  return convs
    .map((c) => {
      const full = loadConversation(c.id);
      if (!full) return '';
      const msgs = full.messages
        .filter((m) => m.role !== 'system')
        .slice(-6)
        .map((m) => `${m.role === 'user' ? 'Utilisateur' : 'Assistant'}: ${m.content}`)
        .join('\n');
      return `--- Session du ${new Date(c.createdAt).toLocaleDateString('fr-FR')} ---\n${msgs}`;
    })
    .filter(Boolean)
    .join('\n\n');
}
