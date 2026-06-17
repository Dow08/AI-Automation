import { NextRequest, NextResponse } from 'next/server';

/**
 * Middleware d'authentification pour les routes API sensibles.
 *
 * Vérifie la présence du token dans :
 *   1. Header `Authorization: Bearer <token>`
 *   2. Cookie `hermes_token=<token>`
 *
 * Si HERMES_SECRET_TOKEN n'est pas défini, l'auth est ignorée
 * (mode développement local uniquement — ne jamais laisser vide en prod).
 *
 * Retourne un NextResponse 401 si non autorisé, ou null si OK.
 */
export function requireAuth(req: NextRequest): NextResponse | null {
  const secret = process.env.HERMES_SECRET_TOKEN;

  // Si aucun secret configuré → dev mode, on passe (avec avertissement)
  if (!secret) {
    // On n'échoue pas pour ne pas bloquer le dev, mais on trace l'absence
    if (process.env.NODE_ENV === 'production') {
      console.error('[AUTH] HERMES_SECRET_TOKEN non configuré — accès refusé en production.');
      return NextResponse.json({ error: 'Non autorisé.' }, { status: 401 });
    }
    return null; // dev : pas de secret = pas de vérification
  }

  // 1. Vérification du header Authorization
  const authHeader = req.headers.get('Authorization') ?? '';
  if (authHeader.startsWith('Bearer ')) {
    const token = authHeader.slice(7).trim();
    if (token === secret) return null; // ✅ Autorisé
  }

  // 2. Vérification du cookie de session
  const cookieToken = req.cookies.get('hermes_token')?.value ?? '';
  if (cookieToken && cookieToken === secret) return null; // ✅ Autorisé

  return NextResponse.json({ error: 'Non autorisé.' }, { status: 401 });
}
