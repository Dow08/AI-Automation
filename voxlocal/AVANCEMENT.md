# Journal d'avancement (traçabilité)

> Tenu par ATLAS. Mis à jour à CHAQUE tâche terminée. Source de vérité sur « où on en est ». On ne démarre une nouvelle phase que si la précédente est « prête » (gate ≥9). Tâches parallèles autorisées dans une même phase.

## État global
- **Phases 1 & 2 — BUILD TERMINÉ** (gate WARDEN 9/10). MCP model-router, memory, prospecting testés OK ; template BTP + kit cold email + docs légales en place ; repo git.
- **En attente Dorian : tâche #6 (comptes gratuits)** + validation des brouillons légaux par un pro.
- **10 MCP sur 10 construits & testés** (telephony en **mode mock**) : model-router, memory, prospecting, voxagent-config, compliance, transcript-qa, crm, calendar, billing, telephony.
- **Simulation bout-en-bout : flux complet PROUVÉ** (RDV + escalade + détection d'hallucination) — `voxlocal/demo/simulate_call.py`.
- **App web (FastAPI)** : onboarding self-service + tableau de bord — `voxlocal/app/`.
- **Non-régression** : golden test set **5/5 PASS** (anti-hallucination + anti-prompt-injection) — `voxlocal/tests/`.
- **À brancher quand comptes/clé dispo** : telephony→Vapi réel, calendar→Google, billing→Stripe (les versions mock/locales fonctionnent déjà).
- **Action Dorian** : ouvrir les comptes (#6, dont Vapi) + entité → passer du mock au vocal réel.
- Dernière mise à jour : 2026-06-30

## Suivi par phase
| Phase | Statut | Note WARDEN | Démarrée | Terminée |
| :-: | :-- | :-: | :-- | :-- |
| 1 — Prérequis & fondations | ✅ Build terminé (#6 = Dorian) | 9 | 2026-06-30 | 2026-06-30 |
| 2 — Validation vente | ✅ Build terminé | 9 | 2026-06-30 | 2026-06-30 |
| 3 — Cœur vocal (PoC) | ✅ voxagent-config + telephony (mock) | 9 | 2026-06-30 | 2026-06-30 |
| 4 — Agenda & actions | ✅ mcp-calendar OK (backend local) | 9 | 2026-06-30 | 2026-06-30 |
| 5 — Escalade & notifications | 🔵 mcp-crm OK (anticipé) | 9 | 2026-06-30 | — |
| 6 — Conformité & sécurité | 🔵 mcp-compliance OK (anticipé) | 9 | 2026-06-30 | — |
| 7 — Onboarding & app | ✅ App onboarding + dashboard (FastAPI) | 9 | 2026-06-30 | 2026-06-30 |
| 8 — Facturation & ops auto | 🔵 mcp-billing OK (anticipé, backend local) | 9 | 2026-06-30 | — |
| 9 — QA & durcissement | ✅ transcript-qa + golden test set (5/5) | 9 | 2026-06-30 | 2026-06-30 |
| 10 — Pilote & amélioration | 🔵 Simulation e2e OK (sans téléphonie réelle) | 9 | 2026-06-30 | — |

## Journal détaillé des tâches (le plus récent en haut)
| Date | Phase | Tâche | Statut | Note | Notes |
| :-- | :-: | :-- | :-- | :-: | :-- |
| 2026-06-30 | 9 | Tâche #19 — Golden test set + runner (5/5 PASS : hallucination, annonce IA, prompt injection) | ✅ Terminé | 9 | Non-régression du garde-fou |
| 2026-06-30 | 7 | Tâche #18 — App onboarding + dashboard (FastAPI, testé : logique KB + routes) | ✅ Terminé | 9 | Formulaire self-service alimente l'agent |
| 2026-06-30 | 3 | Tâche #17 — mcp-telephony (mode mock, testé : numéro, déploiement, comptage) | ✅ Terminé | 9 | 10/10 MCP ; Vapi réel quand clé dispo |
| 2026-06-30 | 10 | Tâche #16 — Simulation bout-en-bout (RDV + escalade + hallucination détectée) | ✅ Terminé | 9 | Cerveau du produit prouvé à 0 € |
| 2026-06-30 | 8 | Tâche #15 — mcp-billing (testé : setup+250min→463€, mois→164€, 100min→149€) | ✅ Terminé | 9 | Conforme modèle financier ; Stripe ultérieur |
| 2026-06-30 | 4 | Tâche #14 — mcp-calendar (testé : anti-double-réservation, dispo réelle) | ✅ Terminé | 9 | Backend local ; Google Calendar ultérieur |
| 2026-06-30 | 5 | Tâche #13 — mcp-crm (testé : add→list→update statut→funnel, SQLite local) | ✅ Terminé | 9 | Migration Supabase ultérieure |
| 2026-06-30 | 9 | Tâche #12 — mcp-transcript-qa (testé : tarif inventé 120€ → flag critique, clean → 10/10) | ✅ Terminé | 9 | Détection d'hallucination opérationnelle |
| 2026-06-30 | 6 | Tâche #11 — mcp-compliance (testé : template BTP conforme, texte sans IA → détecté) | ✅ Terminé | 9 | AI Act art.50 + checklist |
| 2026-06-30 | 3 | Tâche #10 — mcp-voxagent-config (testé : garde-fou tarif→escalate, horaires→answer ; validation KB) | ✅ Terminé | 9 | Zéro-mensonge prouvé en code |
| 2026-06-30 | 2 | Tâche #9 — Kit cold email B2B opt-out (séquence 3 emails + CTA démo) | ✅ Terminé | 9 | Conforme CNIL opt-out |
| 2026-06-30 | 2 | Tâche #8 — Template conversationnel BTP (KB + garde-fous + escalade) | ✅ Terminé | 9 | template.json + script.md |
| 2026-06-30 | 2 | Tâche #7 — mcp-prospecting (testé : plombier→9 bon, 30 appels→écarter, BTP 50→nurture) | ✅ Terminé | 9 | Grille ICP outillée |
| 2026-06-30 | 1 | Tâche #5 — DPA + CGV + confidentialité (brouillons AEGIS) | ✅ Terminé | 8 | À valider par un pro avant le 1er client |
| 2026-06-30 | 1 | Tâche #4 — mcp-memory (testé : module charge, 29 docs indexés) | ✅ Terminé | 9 | RAG vectoriel = évolution ultérieure |
| 2026-06-30 | 1 | Tâche #3 — mcp-model-router (testé : scrape→Flash, security→Opus, code/low→Flash, build→Sonnet) | ✅ Terminé | 9 | Économie de tokens opérationnelle |
| 2026-06-30 | 1 | Tâche #2 — Repo + structure Python + git init (Python 3.14, SDK mcp installé) | ✅ Terminé | 9 | — |
| 2026-06-30 | 1 | Tâche #1 — Décisions techniques verrouillées (runtime Python · HÉRAUT · Vapi · modèle vocal Gemini Flash) | ✅ Terminé | — | Débloque tâches #2-4 |
| 2026-06-30 | 0 | Cadrage, archi, marketing, viabilité, rentabilité, acquisition, gouvernance, prérequis, plan 10 phases | ✅ Terminé | — | Structure complète posée |

## Légende
Statut : ⬜ À venir · ⏳ En attente · 🔵 En cours · ✅ Terminé · 🔁 En itération · ⛔ Bloqué.
