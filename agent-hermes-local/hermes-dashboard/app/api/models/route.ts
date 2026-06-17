import { NextResponse } from 'next/server';

// Sur WSL2 (Linux), Ollama tourne cote Windows — utiliser host.docker.internal
const OLLAMA_URL =
  process.env.OLLAMA_BASE_URL ||
  (process.platform === 'win32'
    ? 'http://localhost:11434'
    : 'http://host.docker.internal:11434');

export async function GET() {
  try {
    const res = await fetch(`${OLLAMA_URL}/api/tags`, {
      signal: AbortSignal.timeout(3000),
    });
    if (!res.ok) {
      throw new Error(`Failed to fetch from Ollama: ${res.statusText}`);
    }
    const data = await res.json() as { models?: Array<{ name: string }> };
    const models = (data.models || []).map((m) => m.name);
    return NextResponse.json({ models });
  } catch {
    return NextResponse.json({ models: [] });
  }
}
