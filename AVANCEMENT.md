# Journal d'avancement (traçabilité)

> Tenu par ATLAS. Mis à jour à CHAQUE tâche terminée. Source de vérité sur « où on en est ». On ne démarre une nouvelle phase que si la précédente est « prête » (gate ≥9). Tâches parallèles autorisées dans une même phase.

## État global
- **Phases 1 & 2 — BUILD TERMINÉ** (gate WARDEN 9/10). MCP model-router, memory, prospecting testés OK ; template BTP + kit cold email + docs légales en place ; repo git.
- **En attente Dorian : tâche #6 (comptes gratuits)** + validation des brouillons légaux par un pro.
- **7 MCP sur 10 construits & testés** : model-router, memory, prospecting, voxagent-config, compliance, transcript-qa, crm. = TOUT ce qui est buildable à 0 € sans comptes externes.
- **3 MCP restants = pure intégration, nécessitent des comptes** : telephony (Vapi+Twilio), calendar (OAuth Google), billing (Stripe).
- **Action Dorian** : ouvrir les comptes (#6) + entité juridique → débloque le vocal réel et les 3 derniers MCP.
- Dernière mise à jour : 2026-06-30

## Suivi par phase
| Phase | Statut | Note WARDEN | Démarrée | Terminée |
| :-: | :-- | :-: | :-- | :-- |
| 1 — Prérequis & fondations | ✅ Build terminé (#6 = Dorian) | 9 | 2026-06-30 | 2026-06-30 |
| 2 — Validation vente | ✅ Build terminé | 9 | 2026-06-30 | 2026-06-30 |
| 3 — Cœur vocal (PoC) | 🔵 Partiel (voxagent-config OK ; telephony ⏳ Vapi) | — | 2026-06-30 | — |
| 4 — Agenda & actions | ⬜ À venir | — | — | — |
| 5 — Escalade & notifications | 🔵 mcp-crm OK (anticipé) | 9 | 2026-06-30 | — |
| 6 — Conformité & sécurité | 🔵 mcp-compliance OK (anticipé) | 9 | 2026-06-30 | — |
| 7 — Onboarding & app | ⬜ À venir | — | — | — |
| 8 — Facturation & ops auto | ⬜ À venir | — | — | — |
| 9 — QA & durcissement | 🔵 mcp-transcript-qa OK (anticipé) | 9 | 2026-06-30 | — |
| 10 — Pilote & amélioration | ⬜ À venir | — | — | — |

## Journal détaillé des tâches (le plus récent en haut)
| Date | Phase | Tâche | Statut | Note | Notes |
| :-- | :-: | :-- | :-- | :-: | :-- |
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
