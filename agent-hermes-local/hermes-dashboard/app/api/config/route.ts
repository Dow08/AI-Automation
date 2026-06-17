import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import yaml from 'yaml';
const ENV_PATH  = process.env.HERMES_ENV_PATH || 'E:/Hermes/.env';
const YAML_PATH = `${process.env.HERMES_MEMORY_PATH || 'E:/Memoire_IA/data'}/config.yaml`;

/** Convert Windows drive paths (E:/foo) to WSL2 mount paths (/mnt/e/foo) on Linux */
function normalizePath(p: string): string {
  if (process.platform !== 'win32') {
    const m = p.match(/^([A-Za-z]):[\\\/](.*)$/);
    if (m) return `/mnt/${m[1].toLowerCase()}/${m[2].replace(/\\/g, '/')}`;
  }
  return p;
}


const MASKED = '••••••••';

function parseEnvFile(content: string): Record<string, string> {
  const result: Record<string, string> = {};
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx === -1) continue;
    const key   = trimmed.slice(0, eqIdx).trim();
    const value = trimmed.slice(eqIdx + 1).trim();
    result[key] = value;
  }
  return result;
}

function patchEnvFile(existingContent: string, updates: Record<string, string>): string {
  const lines   = existingContent.split('\n');
  const patched = new Set<string>();

  const result = lines.map((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) return line;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx === -1) return line;
    const key = trimmed.slice(0, eqIdx).trim();
    if (key in updates) {
      patched.add(key);
      return `${key}=${updates[key]}`;
    }
    return line;
  });

  for (const [key, value] of Object.entries(updates)) {
    if (!patched.has(key)) result.push(`${key}=${value}`);
  }

  return result.join('\n');
}

/** Safely set a nested key in a yaml.Document */
function setNested(doc: yaml.Document, keys: string[], value: unknown): void {
  let node = doc.contents as yaml.YAMLMap;
  for (let i = 0; i < keys.length - 1; i++) {
    let child = node.get(keys[i]) as yaml.YAMLMap | undefined;
    if (!child || !(child instanceof yaml.YAMLMap)) {
      child = doc.createNode({}) as yaml.YAMLMap;
      node.set(keys[i], child);
    }
    node = child;
  }
  node.set(keys[keys.length - 1], value);
}

export async function GET(req: NextRequest) {
  try {
    const envPath  = normalizePath(ENV_PATH);
    const yamlPath = normalizePath(YAML_PATH);

    let envParsed: Record<string, string> = {};
    if (fs.existsSync(envPath)) {
      envParsed = parseEnvFile(fs.readFileSync(envPath, 'utf-8'));
    }

    let cfg: Record<string, unknown> = {};
    if (fs.existsSync(yamlPath)) {
      cfg = (yaml.parse(fs.readFileSync(yamlPath, 'utf-8')) as Record<string, unknown>) || {};
    }

    const display      = (cfg.display      as Record<string, unknown>) || {};
    const modelSection = (cfg.model        as Record<string, unknown>) || {};

    return NextResponse.json({
      // env keys — masked if present
      ANTHROPIC_API_KEY:   envParsed['ANTHROPIC_API_KEY']   ? MASKED : '',
      OPENAI_API_KEY:      envParsed['OPENAI_API_KEY']       ? MASKED : '',
      GEMINI_API_KEY:      envParsed['GEMINI_API_KEY']       ? MASKED : '',
      DISCORD_WEBHOOK_URL: envParsed['DISCORD_WEBHOOK_URL']  ? MASKED : '',
      // yaml keys
      provider:       (modelSection['default_provider'] as string) || 'ollama',
      model:          (modelSection['default_model']    as string) || 'mistral-small:24b',
      tool_progress:  (display['tool_progress']  as string)        || cfg['tool_progress'] as string || 'all',
      streaming:      (display['streaming']      as boolean)       ?? (cfg['streaming']      as boolean) ?? true,
      show_reasoning: (display['show_reasoning'] as boolean)       ?? (cfg['show_reasoning'] as boolean) ?? false,
    });
  } catch (err) {
    console.error('GET /api/config error:', err);
    return NextResponse.json({ error: 'Erreur de lecture de la configuration.' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body     = await req.json() as Record<string, unknown>;
    const envPath  = normalizePath(ENV_PATH);
    const yamlPath = normalizePath(YAML_PATH);

    // ── 1. Update .env ──────────────────────────────────────────────────────
    let existingEnv = '';
    if (fs.existsSync(envPath)) existingEnv = fs.readFileSync(envPath, 'utf-8');

    const envUpdates: Record<string, string> = {};

    // Discord webhook (always write if provided)
    if (body.DISCORD_WEBHOOK_URL !== undefined)
      envUpdates['DISCORD_WEBHOOK_URL'] = String(body.DISCORD_WEBHOOK_URL);

    // Individual provider keys — write directly when not masked and not empty
    const keyFields: [string, string][] = [
      ['ANTHROPIC_API_KEY', 'ANTHROPIC_API_KEY'],
      ['OPENAI_API_KEY',    'OPENAI_API_KEY'   ],
      ['GEMINI_API_KEY',    'GEMINI_API_KEY'   ],
    ];
    for (const [bodyField, envVar] of keyFields) {
      const val = body[bodyField] as string | undefined;
      if (val && val !== MASKED && val.trim()) {
        envUpdates[envVar] = val.trim();
      }
    }

    // Legacy single API_KEY field (backward compat — maps to provider-specific var)
    const rawKey = body.API_KEY as string | undefined;
    if (rawKey && rawKey !== MASKED) {
      envUpdates['API_KEY'] = rawKey;
      if (body.provider === 'anthropic') envUpdates['ANTHROPIC_API_KEY'] = rawKey;
      if (body.provider === 'openai')    envUpdates['OPENAI_API_KEY']    = rawKey;
      if (body.provider === 'google')    envUpdates['GEMINI_API_KEY']    = rawKey;
    }

    if (Object.keys(envUpdates).length > 0) {
      // Ensure parent directory exists
      const envDir = path.dirname(envPath);
      if (!fs.existsSync(envDir)) fs.mkdirSync(envDir, { recursive: true });
      fs.writeFileSync(envPath, patchEnvFile(existingEnv, envUpdates), 'utf-8');
    }

    // ── 2. Update config.yaml ───────────────────────────────────────────────
    const yamlDir = path.dirname(yamlPath);
    if (!fs.existsSync(yamlDir)) fs.mkdirSync(yamlDir, { recursive: true });

    let yamlDoc: yaml.Document;
    if (fs.existsSync(yamlPath)) {
      yamlDoc = yaml.parseDocument(fs.readFileSync(yamlPath, 'utf-8'));
    } else {
      yamlDoc = new yaml.Document({});
    }

    if (!(yamlDoc.contents instanceof yaml.YAMLMap)) {
      yamlDoc.contents = yamlDoc.createNode({}) as yaml.YAMLMap;
    }

    if (body.provider !== undefined)
      setNested(yamlDoc, ['model', 'default_provider'], body.provider);
    if (body.model !== undefined)
      setNested(yamlDoc, ['model', 'default_model'], body.model);
    if (body.tool_progress !== undefined) {
      setNested(yamlDoc, ['display', 'tool_progress'], body.tool_progress);
      (yamlDoc.contents as yaml.YAMLMap).set('tool_progress', body.tool_progress);
    }
    if (body.streaming !== undefined) {
      setNested(yamlDoc, ['display', 'streaming'], body.streaming);
    }
    if (body.show_reasoning !== undefined) {
      setNested(yamlDoc, ['display', 'show_reasoning'], body.show_reasoning);
      (yamlDoc.contents as yaml.YAMLMap).set('show_reasoning', body.show_reasoning);
    }

    fs.writeFileSync(yamlPath, String(yamlDoc), 'utf-8');

    return NextResponse.json({ success: true, message: 'Configuration sauvegardee avec succes.' });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('POST /api/config error:', msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
