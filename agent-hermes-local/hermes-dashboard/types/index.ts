export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  type?: 'text' | 'setup';
}

export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  model: string;
  createdAt: number;
  updatedAt: number;
}

export interface ConversationSummary {
  id: string;
  title: string;
  preview: string;
  model: string;
  messageCount: number;
  createdAt: number;
  updatedAt: number;
}

export interface HermesConfig {
  MODEL_PROVIDER: string;
  OLLAMA_MODEL: string;
  API_KEY: string;
  DISCORD_WEBHOOK_URL: string;
  MODEL_URL?: string;
}

export interface ModelOption {
  id: string;
  name: string;
  group: 'local' | 'cloud';
  provider: string;
}

export interface UserMemory {
  profile: Record<string, string>;
  preferences: Record<string, string>;
  lastUpdated: number;
}
