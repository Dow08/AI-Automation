# Serveurs MCP VoxLocal (Python)

> Runtime décidé : **Python** (testé 3.14 sur la machine de dev). Sur Windows, utiliser le lanceur **`py`** (l'alias `python` du Microsoft Store est désactivé).

## Installation
```powershell
py -m venv .venv
.venv\Scripts\activate
py -m pip install mcp
```

## Lancer un serveur (transport stdio)
```powershell
py mcp/model_router/server.py
py mcp/memory/server.py
```

## Brancher dans un client MCP
```json
{
  "mcpServers": {
    "voxlocal-model-router": { "command": "py", "args": ["mcp/model_router/server.py"] },
    "voxlocal-memory":       { "command": "py", "args": ["mcp/memory/server.py"] }
  }
}
```

## Serveurs (Phase 1)
- **model_router** — route chaque tâche vers le modèle optimal (Flash/Haiku/Sonnet/Opus) pour l'économie de tokens.
- **memory** — expose les documents du projet (contexte/mémoires) pour que les agents lisent avant d'agir (anti-dérive).

## À venir (phases suivantes)
prospecting · telephony · voxagent-config · calendar · crm · compliance · billing · transcript-qa.

## Variables d'env
Voir `.env.example` à la racine.
