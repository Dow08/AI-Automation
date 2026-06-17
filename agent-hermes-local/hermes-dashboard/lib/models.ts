import type { ModelOption } from '@/types';

export const CLOUD_MODELS: ModelOption[] = [
  // Anthropic — IDs corrects pour l'API Anthropic v2
  { id: 'claude-sonnet-4-6',       name: 'Claude Sonnet 4.6',  group: 'cloud', provider: 'anthropic' },
  { id: 'claude-opus-4-6',         name: 'Claude Opus 4.6',    group: 'cloud', provider: 'anthropic' },
  { id: 'claude-haiku-4-5-20251001', name: 'Claude Haiku 4.5', group: 'cloud', provider: 'anthropic' },
  // OpenAI
  { id: 'gpt-4o',       name: 'GPT-4o',      group: 'cloud', provider: 'openai' },
  { id: 'gpt-4o-mini',  name: 'GPT-4o Mini', group: 'cloud', provider: 'openai' },
  // Google
  { id: 'gemini-1.5-pro',   name: 'Gemini 1.5 Pro',   group: 'cloud', provider: 'google' },
  { id: 'gemini-1.5-flash', name: 'Gemini 1.5 Flash',  group: 'cloud', provider: 'google' },
  { id: 'gemini-2.0-flash', name: 'Gemini 2.0 Flash',  group: 'cloud', provider: 'google' },
];

export const FALLBACK_LOCAL_MODELS: ModelOption[] = [
  { id: 'mistral-small:24b', name: 'Mistral Small 24B', group: 'local', provider: 'ollama' },
  { id: 'mixtral',           name: 'Mixtral 8x7B',      group: 'local', provider: 'ollama' },
  { id: 'mistral',           name: 'Mistral 7B',        group: 'local', provider: 'ollama' },
  { id: 'llama3',            name: 'Llama 3 8B',        group: 'local', provider: 'ollama' },
  { id: 'glm4',              name: 'GLM-4 9B',          group: 'local', provider: 'ollama' },
];

export const DEFAULT_MODEL = 'mistral-small:24b';
