import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const ENV_PATH = process.env.HERMES_ENV_PATH || 'E:/Hermes/.env';

function parseEnvFile(content: string): Record<string, string> {
  const result: Record<string, string> = {};
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx === -1) continue;
    result[trimmed.slice(0, eqIdx).trim()] = trimmed.slice(eqIdx + 1).trim();
  }
  return result;
}


/** Convert Windows drive paths to WSL2 mount paths on Linux */
function normalizePath(p: string): string {
  if (process.platform !== 'win32') {
    const m = p.match(/^([A-Za-z]):[\\\/](.*)$/);
    if (m) return `/mnt/${m[1].toLowerCase()}/${m[2].replace(/\\/g, '/')}`;
  }
  return p;
}

function readEnvConfig(): Record<string, string> {
  try {
    const envPath = normalizePath(ENV_PATH);
    if (fs.existsSync(envPath)) {
      return parseEnvFile(fs.readFileSync(envPath, 'utf-8'));
    }
  } catch { /* ignore */ }
  return {};
}

export async function GET() {
  const envConfig = readEnvConfig();

  const cloudProviders = [
    {
      id:       'anthropic',
      name:     'Anthropic Claude',
      icon:     'robot',
      color:    '#D97757',
      hasKey:   !!(envConfig['ANTHROPIC_API_KEY'] || envConfig['API_KEY']),
      keyLabel: 'ANTHROPIC_API_KEY',
    },
    {
      id:       'openai',
      name:     'OpenAI GPT',
      icon:     'sparkles',
      color:    '#10B981',
      hasKey:   !!envConfig['OPENAI_API_KEY'],
      keyLabel: 'OPENAI_API_KEY',
    },
    {
      id:       'google',
      name:     'Google Gemini',
      icon:     'globe',
      color:    '#3B82F6',
      hasKey:   !!envConfig['GEMINI_API_KEY'],
      keyLabel: 'GEMINI_API_KEY',
    },
    {
      id:       'discord',
      name:     'Discord Webhook',
      icon:     'chat',
      color:    '#5865F2',
      hasKey:   !!envConfig['DISCORD_WEBHOOK_URL'],
      keyLabel: 'DISCORD_WEBHOOK_URL',
    },
  ];

  const defaultOllamaUrl = process.platform === 'win32' ? 'http://localhost:11434' : 'http://host.docker.internal:11434';
    const ollamaUrl = envConfig['OLLAMA_URL'] || defaultOllamaUrl;
  let runningModels: string[]   = [];
  let availableModels: string[] = [];
  let ollamaOnline              = false;

  try {
    const [psRes, tagsRes] = await Promise.all([
      fetch(`${ollamaUrl}/api/ps`,   { signal: AbortSignal.timeout(2000) }),
      fetch(`${ollamaUrl}/api/tags`, { signal: AbortSignal.timeout(2000) }),
    ]);
    if (psRes.ok) {
      const ps = await psRes.json();
      runningModels = (ps.models || []).map((m: { name: string }) => m.name);
      ollamaOnline  = true;
    }
    if (tagsRes.ok) {
      const tags = await tagsRes.json();
      availableModels = (tags.models || []).map((m: { name: string }) => m.name);
      ollamaOnline    = true;
    }
  } catch { /* Ollama offline */ }

  // Ne pas exposer l'URL complète (pourrait contenir des credentials)
  // On retourne uniquement le host pour l'affichage
  let ollamaDisplayUrl = 'localhost:11434';
  try {
    const parsed = new URL(ollamaUrl);
    ollamaDisplayUrl = parsed.host;
  } catch { /* invalid URL, keep fallback */ }

  return NextResponse.json({
    cloudProviders,
    ollama: { online: ollamaOnline, url: ollamaDisplayUrl, runningModels, availableModels },
  }, { headers: { 'Cache-Control': 'no-store' } });
}
