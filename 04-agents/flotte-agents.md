# Flotte d'agents VoxLocal (11)

| Agent | Fonction | Skills |
| :-- | :-- | :-- |
| **ATLAS** 🧭 | Chef d'orchestre : décompose, assigne, maintient mémoires, boucle d'itération | planning, memory-write, gating-score, model-router |
| **FORGE** 🔨 | Builder : code la PWA + MCP servers, tests, git | code-gen, mcp-build, test-runner, git |
| **RELAY** 🔌 | Intégrations agenda & téléphonie | api-integration, oauth, calendar, telephony |
| **SCRIBE** ✍️ | Scripts conversationnels par métier + garde-fous anti-hallucination | prompt-eng, vertical-knowledge, guardrails |
| **SENTINEL** 🛡️ | QA appels : transcripts, dérives, fiabilité, non-régression | transcript-qa, eval, testing |
| **WARDEN** 🚦 | **Gardien de PRODUCTION** : note chaque livrable 0-10, BLOQUE tout < 9/10, déclenche l'itération | code-review, security-review, prod-gate, scoring |
| **HÉRAUT** 📣 | Growth : marketing, mirror demos, contenus, séquences | copywriting, mirror-demo, content, funnel |
| **PROSPECT** 🎯 | Acquisition : scrape/qualifie via grille ICP, OSINT | scraping, osint, qualification |
| **AEGIS** ⚖️ | Conformité & sécurité : AI Act, RGPD, résidence, supply-chain | compliance-check, rgpd, ai-act, security |
| **LEDGER** 💰 | Finance : gating 0-10, projections, marge | cost-model, gating-score, billing |
| **CURATOR** 📚 | Mémoire & doc : base RAG, journal frictions, registre bugs, « jamais de dérive » | memory, rag, doc-gen |

**Parallélisation :** FORGE+RELAY codent · SCRIBE écrit les templates · PROSPECT+HÉRAUT préparent les démos · AEGIS valide conformité/sécu · LEDGER score les coûts · **WARDEN valide la prod** · ATLAS synchronise · CURATOR archive (frictions/bugs).

**Note :** la vente terrain reste humaine (Dorian close). Les agents préparent tout en amont.
