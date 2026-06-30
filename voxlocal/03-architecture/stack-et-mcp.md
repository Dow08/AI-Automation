# Stack open source + MCP

## Stack de build (100 % OSS / free)
| Couche | Outil | Rôle |
| :-- | :-- | :-- |
| Orchestration | **n8n** (self-host) | Workflows, sync, notifs, colle MCP |
| App | **PWA React/Next.js** | Interface simple, installable mobile |
| Base & auth | **Supabase** (free) ou **PocketBase** | Clients, prospects, contrats |
| Mémoire/RAG | **Qdrant / Chroma** | Anti-dérive |
| Voix self-host (phase 2) | **Whisper** + **Piper/Coqui** + **FreeSWITCH/Asterisk** | Ré-internalisation marge |
| Voix V1 (COGS, gated ≥9) | Vapi / Retell white-label | Payé après vente |

## Les 10 MCP à créer (🔧 build / ⚙️ runtime)
1. **mcp-calendar** ⚙️ — agenda unifié (Google/Outlook/Calendly/CalDAV).
2. **mcp-telephony** ⚙️ — abstraction Vapi/Retell/Twilio.
3. **mcp-voxagent-config** ⚙️ — templates par verticale + garde-fous.
4. **mcp-crm** ⚙️ — prospects, démos, contrats.
5. **mcp-transcript-qa** ⚙️ — détection hallucination/dérive, score.
6. **mcp-billing** ⚙️ — setup + MRR + overage (Lago OSS ou Stripe si gate ≥9).
7. **mcp-prospecting** 🔧 — scrape + qualif ICP + OSINT.
8. **mcp-memory** 🔧 — mémoires + RAG anti-dérive.
9. **mcp-compliance** 🔧⚙️ — AI Act art.50, RGPD, résidence UE.
10. **mcp-model-router** 🔧⚙️ — route Gemini Flash ⇄ Claude + garde-fous.

## Runtime & adaptivité modèles
- **Runtime des MCP = Python** (décidé 2026-06-30 ; venv/uv + SDK MCP Python).
- **Agent vocal (prod) = Gemini Flash** par défaut (perf/coût/latence, bon FR) ; escalade ponctuelle vers un modèle plus fort si une tâche l'exige.
- Tâches massives/répétitives = Flash/Haiku · raisonnement critique (archi, sécurité, conformité, QA) = Claude Sonnet/Opus.
- Chaque agent charge sa charte + lit la mémoire AVANT d'agir + sortie schéma strict.
