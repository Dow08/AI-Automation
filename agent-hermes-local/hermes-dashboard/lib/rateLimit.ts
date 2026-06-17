/**
 * Rate limiter en mémoire — pas de dépendance externe.
 * Max 20 requêtes par minute par IP.
 * Cleanup automatique toutes les 5 minutes pour éviter les fuites mémoire.
 */

interface RateLimitRecord {
  count: number;
  resetAt: number;
}

const MAX_REQUESTS = 20;
const WINDOW_MS = 60_000; // 1 minute

const store = new Map<string, RateLimitRecord>();

// Nettoyage périodique des entrées expirées
const cleanup = () => {
  const now = Date.now();
  for (const [key, record] of store) {
    if (now > record.resetAt) store.delete(key);
  }
};
// setInterval retourne un Timeout — on le détache pour ne pas bloquer le process
const timer = setInterval(cleanup, 5 * 60_000);
if (typeof timer.unref === 'function') timer.unref();

/**
 * Vérifie si l'IP est autorisée à faire une nouvelle requête.
 * @param ip  Adresse IP du client (depuis x-forwarded-for ou req.ip)
 * @returns   { allowed: boolean; remaining: number; resetIn: number }
 */
export function checkRateLimit(ip: string): {
  allowed: boolean;
  remaining: number;
  resetIn: number; // ms avant réinitialisation
} {
  const now = Date.now();
  const record = store.get(ip);

  if (!record || now > record.resetAt) {
    // Première requête ou fenêtre expirée
    store.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return { allowed: true, remaining: MAX_REQUESTS - 1, resetIn: WINDOW_MS };
  }

  record.count += 1;

  if (record.count > MAX_REQUESTS) {
    return { allowed: false, remaining: 0, resetIn: record.resetAt - now };
  }

  return { allowed: true, remaining: MAX_REQUESTS - record.count, resetIn: record.resetAt - now };
}

/**
 * Extrait l'IP du client depuis la requête Next.js.
 * Priorité : x-forwarded-for > x-real-ip > "127.0.0.1" (localhost fallback)
 */
export function getClientIP(req: Request): string {
  const headers = (req as { headers: Headers }).headers;
  const forwarded = headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim();
  const realIp = headers.get('x-real-ip');
  if (realIp) return realIp.trim();
  return '127.0.0.1';
}
