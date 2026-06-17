import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import {
  saveConversation,
  loadUserMemory,
  getRecentConversationsContext,
} from '@/lib/memory';
import { CLOUD_MODELS, FALLBACK_LOCAL_MODELS } from '@/lib/models';
import { checkRateLimit, getClientIP } from '@/lib/rateLimit';
import type { Message, Conversation } from '@/types';

const MAX_BODY_BYTES = 10 * 1024; // 10 KB

const HERMES_PATH = process.env.HERMES_PATH || 'E:/Hermes';
const ENV_PATH = process.env.HERMES_ENV_PATH || `${HERMES_PATH}/.env`;
const SOUL_PATH = `${HERMES_PATH}/config/SOUL.md`;

/** Convert Windows drive paths (E:/foo) to WSL2 mount paths (/mnt/e/foo) on Linux */
function normalizePath(p: string): string {
  if (process.platform !== 'win32') {
    const m = p.match(/^([A-Za-z]):[\\\/](.*)$/);
    if (m) return `/mnt/${m[1].toLowerCase()}/${m[2].replace(/\\/g, '/')}`;
  }
  return p;
}


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

function readEnvConfig(): Record<string, string> {
  try {
    const envPath = normalizePath(ENV_PATH);
    if (fs.existsSync(envPath)) {
      return parseEnvFile(fs.readFileSync(envPath, 'utf-8'));
    }
  } catch { /* ignore */ }
  return {};
}

function readSoul(): string {
  try {
    if (fs.existsSync(normalizePath(SOUL_PATH))) {
      return fs.readFileSync(normalizePath(SOUL_PATH), 'utf-8').trim();
    }
  } catch { /* ignore */ }
  return '';
}

// ─── Ollama ─────────────────────────────────────────────────────────────────
async function callOllama(messages: Message[], model: string, ollamaUrl: string): Promise<string> {
  const response = await fetch(`${ollamaUrl}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model,
      messages: messages.map((m) => ({ role: m.role, content: m.content })),
      stream: false,
    }),
  });
  if (!response.ok) throw new Error(`Ollama error: ${response.status} ${await response.text()}`);
  const data = await response.json();
  return data?.message?.content || '';
}

// ─── Anthropic native SDK-compatible REST call ────────────────────────────────
async function callAnthropic(messages: Message[], model: string, apiKey: string): Promise<string> {
  const systemMsg = messages.find((m) => m.role === 'system');
  const chatMessages = messages
    .filter((m) => m.role !== 'system')
    .map((m) => ({ role: m.role, content: m.content }));

  const body: Record<string, unknown> = {
    model,
    max_tokens: 4096,
    messages: chatMessages,
  };
  if (systemMsg) body.system = systemMsg.content;

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) throw new Error(`Anthropic error: ${response.status} ${await response.text()}`);
  const data = await response.json();
  return data?.content?.[0]?.text || '';
}

// ─── OpenAI-compatible (OpenAI, Google Gemini OpenAI-compat) ─────────────────
async function callOpenAICompat(
  messages: Message[],
  model: string,
  apiKey: string,
  baseUrl: string
): Promise<string> {
  const url = `${baseUrl.replace(/\/$/, '')}/chat/completions`;
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: messages.map((m) => ({ role: m.role, content: m.content })),
      max_tokens: 4096,
    }),
  });
  if (!response.ok) throw new Error(`API error: ${response.status} ${await response.text()}`);
  const data = await response.json();
  return data?.choices?.[0]?.message?.content || '';
}

export async function POST(req: NextRequest) {
  // ── Rate limiting — 20 req/min par IP ──────────────────────────────────────
  const ip = getClientIP(req);
  const rl = checkRateLimit(`chat:${ip}`);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: 'Trop de requêtes. Réessaie dans 1 minute.' },
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
    // ── Validation de la taille du body ─────────────────────────────────────
    const contentLength = req.headers.get('content-length');
    if (contentLength && parseInt(contentLength, 10) > MAX_BODY_BYTES) {
      return NextResponse.json({ error: 'Requête trop volumineuse (max 10 KB).' }, { status: 413 });
    }

    const rawText = await req.text();
    if (rawText.length > MAX_BODY_BYTES) {
      return NextResponse.json({ error: 'Requête trop volumineuse (max 10 KB).' }, { status: 413 });
    }

    let body: unknown;
    try {
      body = JSON.parse(rawText);
    } catch {
      return NextResponse.json({ error: 'JSON invalide.' }, { status: 400 });
    }

    if (!body || typeof body !== 'object') {
      return NextResponse.json({ error: 'Corps de requête invalide.' }, { status: 400 });
    }

    const { messages, modelId, conversationId } = body as {
      messages: Message[];
      modelId: string;
      conversationId?: string;
    };

    // ── Validation des types ────────────────────────────────────────────────
    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: 'messages doit être un tableau non vide.' }, { status: 400 });
    }
    if (typeof modelId !== 'string' || !modelId.trim()) {
      return NextResponse.json({ error: 'modelId invalide.' }, { status: 400 });
    }
    if (conversationId !== undefined && typeof conversationId !== 'string') {
      return NextResponse.json({ error: 'conversationId invalide.' }, { status: 400 });
    }

    // ── /setup shortcut ──────────────────────────────────────────────────────
    const lastMsg = messages[messages.length - 1];
    if (lastMsg?.role === 'user' && lastMsg.content.trim().toLowerCase() === '/setup') {
      return NextResponse.json({
        reply: "Chargement de l'assistant de configuration interactive...",
        conversationId: conversationId || uuidv4(),
        modelUsed: modelId,
        type: 'setup',
      });
    }

    const envConfig = readEnvConfig();
    const soul = readSoul();
    const allModels = [...FALLBACK_LOCAL_MODELS, ...CLOUD_MODELS];
    const modelInfo = allModels.find((m) => m.id === modelId);
    const isLocal = modelInfo?.group === 'local' || (!modelInfo && !modelId.includes('-'));

    // ── System prompt (SOUL + Memory) ────────────────────────────────────────
    const userMemory = loadUserMemory();
    const recentContext = getRecentConversationsContext(3);
    const memoryBlock = [
      Object.keys(userMemory.profile).length > 0
        ? `Profil utilisateur:\n${JSON.stringify(userMemory.profile, null, 2)}`
        : '',
      recentContext ? `Contexte des conversations récentes:\n${recentContext}` : '',
    ]
      .filter(Boolean)
      .join('\n\n');

    const soulBlock = soul
      ? soul
      : `Tu es JAROD, un assistant IA local avancé et sécurisé. Tu mémorises tes échanges pour t'améliorer au fil du temps.`;

    const systemPrompt = [
      soulBlock,
      memoryBlock,
      'Réponds toujours en français sauf demande contraire.',
    ]
      .filter(Boolean)
      .join('\n\n');

    const fullMessages: Message[] = [
      { id: 'sys', role: 'system', content: systemPrompt, timestamp: Date.now() },
      ...messages,
    ];

    let reply = '';
    let usedModel = modelId;
    let fallbackUsed = false;

    if (isLocal) {
      // ── Local Ollama ─────────────────────────────────────────────────────
      // Sur WSL2 (Linux), Ollama tourne sur Windows — utiliser host.docker.internal
    const defaultOllamaUrl = process.platform === 'win32'
      ? 'http://localhost:11434'
      : 'http://host.docker.internal:11434';
    const ollamaUrl = envConfig['MODEL_URL'] || envConfig['OLLAMA_BASE_URL'] || defaultOllamaUrl;
      try {
        reply = await callOllama(fullMessages, modelId, ollamaUrl);
      } catch (ollamaErr) {
        console.warn('Ollama failed, trying cloud fallback:', ollamaErr);
        fallbackUsed = true;
        const anthropicKey = envConfig['ANTHROPIC_API_KEY'] || envConfig['API_KEY'];
        if (anthropicKey) {
          usedModel = 'claude-3-5-sonnet-20241022';
          reply = await callAnthropic(fullMessages, usedModel, anthropicKey);
        } else {
          const openaiKey = envConfig['OPENAI_API_KEY'];
          if (openaiKey) {
            usedModel = 'gpt-4o';
            reply = await callOpenAICompat(fullMessages, usedModel, openaiKey, 'https://api.openai.com/v1');
          } else {
            throw new Error('Ollama non disponible (ECONNREFUSED). Lance `ollama serve` dans un terminal WSL2, ou configure une cle API cloud dans les Parametres.');
          }
        }
      }
    } else {
      // ── Cloud model ─────────────────────────────────────────      // ── Cloud model ──────────────────────────────────────────────────────
      const provider = modelInfo?.provider || 'openai';

      if (provider === 'anthropic') {
        const apiKey = envConfig['ANTHROPIC_API_KEY'] || envConfig['API_KEY'];
        if (!apiKey) throw new Error('Cle API Anthropic manquante dans le fichier .env');
        reply = await callAnthropic(fullMessages, modelId, apiKey);

      } else if (provider === 'openai') {
        const apiKey = envConfig['OPENAI_API_KEY'] || envConfig['API_KEY'];
        if (!apiKey) throw new Error('Cle API OpenAI manquante dans le fichier .env');
        reply = await callOpenAICompat(fullMessages, modelId, apiKey, 'https://api.openai.com/v1');

      } else if (provider === 'google') {
        const apiKey = envConfig['GEMINI_API_KEY'] || envConfig['API_KEY'];
        if (!apiKey) throw new Error('Cle API Google Gemini manquante dans le fichier .env');
        reply = await callOpenAICompat(
          fullMessages,
          modelId,
          apiKey,
          'https://generativelanguage.googleapis.com/v1beta/openai/'
        );

      } else {
        throw new Error(`Fournisseur inconnu : ${provider}`);
      }
    }

    // ── Save conversation ──────────────────────────────────────────────────
    const convId = conversationId || uuidv4();
    const firstUserMsg = messages.find((m) => m.role === 'user');
    const title = firstUserMsg?.content?.slice(0, 60) || 'Nouvelle conversation';

    const newAssistantMsg: Message = {
      id: uuidv4(),
      role: 'assistant',
      content: reply,
      timestamp: Date.now(),
    };

    const conv: Conversation = {
      id: convId,
      title,
      messages: [...messages, newAssistantMsg],
      model: usedModel,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    saveConversation(conv);

    return NextResponse.json({ reply, conversationId: convId, modelUsed: usedModel, fallbackUsed });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erreur inconnue';
    console.error('POST /api/chat error:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
