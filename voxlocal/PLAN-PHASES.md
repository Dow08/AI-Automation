# Plan en 10 phases — VoxLocal

> Couches successives. **Règle : on ne démarre une phase que si la précédente est « prête » (gate WARDEN ≥ 9/10).** Plusieurs tâches d'UNE phase peuvent tourner en parallèle. Chaque phase = boucle d'itération + notation (voir `05-processus/boucle-coherence.md`). Modèle conseillé indiqué pour l'économie de tokens (Flash/Haiku < Sonnet < Opus).

## Légende modèles
- **Flash/Haiku** : scrape, tri, brouillons, contenu volumineux, voix temps réel, tâches répétitives.
- **Sonnet** : build standard, intégrations, code courant.
- **Opus** : architecture, sécurité, conformité, garde-fous, QA adverse, décisions critiques.

| Ph | Objectif | Tâches clés | Agents (skills) | MCP construit | Modèle | Critère de sortie (gate) |
| :-: | :-- | :-- | :-- | :-- | :-: | :-- |
| **1** | **Prérequis & fondations** | Verrouiller C1-C3, repo, structure, socle | ATLAS, FORGE (code-gen), LEDGER, AEGIS | mcp-memory, mcp-model-router | Opus (décisions) + Sonnet | Prérequis bloquants OK · router opérationnel · ≥9 |
| **2** | **Validation vente (assets)** | Sourcing + ICP, 1er template BTP, kit cold email + démo | PROSPECT (scraping/osint), SCRIBE (prompt-eng), HÉRAUT (copywriting) | mcp-prospecting | Flash (scrape/contenu) + Sonnet | 30 prospects qualifiés + démo perso générée · ≥9 |
| **3** | **Cœur vocal (PoC)** | Raccordement renvoi d'appel, agent BTP, garde-fou zéro-mensonge | RELAY (telephony), SCRIBE (guardrails) | mcp-telephony, mcp-voxagent-config | Opus (garde-fou) + Sonnet | Appel test : factuel-ou-escalade prouvé · ≥9 |
| **4** | **Agenda & actions** | Connecteurs agenda, dispo réelle, poser/déplacer/annuler RDV | RELAY (oauth/calendar) | mcp-calendar | Sonnet | RDV réel posé depuis un appel · ≥9 |
| **5** | **Escalade & notifications** | Fallback dirigeant (SMS/WhatsApp), confirmation client, dégradation gracieuse | FORGE, RELAY | mcp-crm (+ n8n) | Sonnet | Escalade + notif + failover testés · ≥9 |
| **6** | **Conformité & sécurité** | DPA, annonce IA, résidence UE, secrets, anti-toll-fraud, anti-prompt-injection | AEGIS (rgpd/ai-act/security) | mcp-compliance | Opus | Check-list conformité + sécu 100 % · ≥9 |
| **7** | **Onboarding self-serve & app** | Formulaire KB, OAuth, dashboard client, PWA | FORGE (code-gen), RELAY | — | Sonnet + Flash (contenu) | Onboarding bout-en-bout sans intervention · ≥9 |
| **8** | **Facturation & ops auto** | Stripe/metering, monitoring, observabilité, rapport ROI auto | FORGE, LEDGER, SENTINEL | mcp-billing | Sonnet | Paiement + metering + alertes OK · ≥9 |
| **9** | **QA & durcissement** | Golden test set par verticale, tests adverses, gate global | SENTINEL (eval), WARDEN | mcp-transcript-qa | Opus (eval) + Sonnet | 0 hallucination sur jeu adverse · ≥9 |
| **10** | **Pilote & boucle d'amélioration** | Déploiement chez Dorian (pilote 0) + 3 pilotes, mesure, itération | ATLAS, HÉRAUT, SENTINEL | — | Sonnet | Pilote 0 fonctionnel + retours intégrés · ≥9 |

## Boucle d'itération par phase
```
Construire → SENTINEL/AEGIS testent → WARDEN note /10 →
  ≥9 ? oui → phase « prête », consigner dans AVANCEMENT.md → phase suivante
        non → consigner cause (06-frictions) → corriger → re-tester
```

## Parallélisation
Au sein d'une phase, les tâches indépendantes tournent en parallèle (ex. Ph2 : PROSPECT scrape pendant que SCRIBE rédige). On NE saute PAS à la phase suivante tant que la phase courante n'est pas « prête ».

## Les 10 MCP, répartis
P1: mcp-memory, mcp-model-router · P2: mcp-prospecting · P3: mcp-telephony, mcp-voxagent-config · P4: mcp-calendar · P5: mcp-crm · P6: mcp-compliance · P8: mcp-billing · P9: mcp-transcript-qa.
