# Topologie du système VoxLocal

> Vue d'ensemble pour reprise/débogage par un tiers. 3 plans : appel (runtime), contrôle (agents), données. Source Mermaid ci-dessous (éditable/versionnable).

## Plan d'appel (runtime) — le flux à déboguer en priorité

```mermaid
flowchart TB
  A([Appelant]) -->|Renvoi d'appel conditionnel| DID[DID / Téléphonie<br/>Twilio · Vapi]
  DID --> VOX[Couche voix<br/>STT + TTS]
  VOX --> ORCH[Orchestrateur<br/>Vapi / Retell]
  ORCH --> ROUTER[[mcp-model-router]]
  ROUTER --> LLM{LLM<br/>Gemini Flash / Claude}
  LLM -->|lit KB vérifiée| KB[[mcp-voxagent-config]]
  LLM -->|lit dispo réelle| CAL[[mcp-calendar]]
  LLM --> DEC{Factuel & dans le périmètre ?}
  DEC -->|OUI| ACT[Action : poser/déplacer RDV · info]
  DEC -->|NON / incertain| ESC[Escalade - zéro mensonge]
  ACT --> CAL
  ACT --> NOTIF[[mcp-crm + n8n]]
  ESC --> NOTIF
  NOTIF --> OWNER([Dirigeant<br/>SMS / WhatsApp])
  NOTIF --> CONF([Confirmation appelant])
  ORCH --> LOG[Logs / transcripts]
  LOG --> QA[[mcp-transcript-qa]]
  ORCH -. si panne .-> FAIL[Dégradation gracieuse<br/>messagerie / 2e renvoi]
```

## Plan de contrôle (agents) & plan de données

```mermaid
flowchart LR
  subgraph CTRL[Plan de contrôle - agents]
    ATLAS[ATLAS orchestre] --> FORGE & RELAY & SCRIBE
    SENTINEL --> WARDEN[WARDEN gate prod 9/10]
    AEGIS[AEGIS conformite/securite]
    LEDGER[LEDGER gating euro 9/10]
    PROSPECT & HERAUT[HERAUT growth]
    CURATOR[CURATOR memoires/frictions/bugs]
  end
  subgraph DATA[Plan de donnees]
    DB[(Supabase/PocketBase<br/>multi-tenant)]
    RAG[(Qdrant RAG)]
    VAULT[(Coffre secrets)]
    BILL[[mcp-billing]]
    PROSP[[mcp-prospecting]]
    COMP[[mcp-compliance]]
  end
  WARDEN -. autorise .-> FORGE
  AEGIS -. valide .-> COMP
  ATLAS --- CURATOR
  CURATOR --- DB
```

## Légende des points de rupture probables (pour le débogueur)
1. **Renvoi d'appel** mal configuré côté opérateur → l'IA ne reçoit rien.
2. **DID / provisioning** non validé (SIRET) → numéro inactif.
3. **OAuth agenda** expiré → dispo illisible → fausses promesses (à bloquer).
4. **mcp-model-router** : mauvais modèle/latence → coupures.
5. **Garde-fou KB** : tarif hors base → DOIT escalader, jamais inventer.
6. **Panne stack** → la dégradation gracieuse doit reprendre la main.
