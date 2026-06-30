# Prérequis du projet VoxLocal

> Tout doit être réuni/validé pour que les phases s'exécutent sans blocage. Légende : **[D]** = action Dorian · **[A]** = ATLAS peut le faire · 💶 = coût (gated, engagé seulement si LEDGER ≥9) · 🆓 = gratuit/OSS.

## A. Administratif & légal
| # | Prérequis | Resp. | Coût |
| :-: | :-- | :-: | :-: |
| A1 | **Entité juridique** (micro-entreprise min) → SIRET | [D] | 🆓 |
| A2 | **RC Pro** (assurance responsabilité) | [D] | 💶 ~300 €/an |
| A3 | **DPA** (art.28) + **CGV** + politique de confidentialité | [A] rédige, [D] valide | 🆓 |
| A4 | Compte bancaire pro séparé | [D] | 🆓/💶 |

## B. Comptes & infra (🆓 tant que possible, 💶 après preuve)
| # | Prérequis | Resp. | Coût |
| :-: | :-- | :-: | :-: |
| B1 | Plateforme white-label voix (Vapi **ou** Retell) — compte dev | [A] | 🆓 puis 💶/min |
| B2 | Téléphonie Twilio + **regulatory bundle FR** (KBIS/ID) → numéro test | [D] docs, [A] config | 💶 ~1-2 €/n° |
| B3 | Clés API LLM : **Gemini** (free) + **Anthropic** (Claude) | [D] crée, [A] intègre | 🆓 puis 💶 |
| B4 | **n8n** self-host (VPS ou local) | [A] | 🆓 (VPS ~5 €/mo plus tard) |
| B5 | Base de données : **Supabase** (free) ou **PocketBase** | [A] | 🆓 |
| B6 | Vector store : **Qdrant/Chroma** | [A] | 🆓 |
| B7 | **Stripe** (facturation) | [D] crée, [A] intègre | 🆓 (commission) |
| B8 | Coffre à secrets (**Doppler**/Vault) + domaine + email pro | [A]/[D] | 🆓/💶 |
| B9 | Repo git + environnement de dev (**Python** : venv/uv, MCP SDK Python) | [A] | 🆓 |
| B10 | Hébergeur **UE** (Scaleway/OVH) pour résidence données | [A] config, [D] compte | 💶 |

## C. Décisions techniques (à verrouiller)
| # | Décision | Défaut proposé | Statut |
| :-: | :-- | :-- | :-: |
| C1 | Runtime MCP | **Python** | ✅ acté |
| C2 | Renommage HERMES→HÉRAUT | Oui | ✅ acté |
| C3 | Plateforme white-label (PoC) | **Vapi** | ✅ acté |
| C4 | Verticale de départ | BTP | ✅ acté |
| C5 | Modèle LLM agent vocal (prod) | **Gemini Flash** (perf/coût/latence) ; escalade ponctuelle si besoin | ✅ acté |

## D. Contenu & savoir
| # | Prérequis | Resp. |
| :-: | :-- | :-: |
| D1 | Structure KB (horaires/tarifs/prestations/FAQ) par verticale | [A] |
| D2 | Scripts conversationnels par métier (BTP d'abord) | [A] SCRIBE |
| D3 | **Golden test set** (cas d'appels par verticale) | [A] SENTINEL |
| D4 | Templates cold email opt-out conformes | [A] HÉRAUT |

## E. Capacités (skills & routing)
| # | Prérequis | Resp. |
| :-: | :-- | :-: |
| E1 | Skills dédiés attribués à chaque agent | [A] |
| E2 | **mcp-model-router** : mapping tâche→modèle (économie tokens) | [A] |

## Prérequis bloquants pour démarrer la Phase 1
~~C1 (runtime) confirmé~~ ✅ Python · B9 (repo) · E2 (router). Le reste s'active au fil des phases via le gating.

**Décisions verrouillées le 2026-06-30 :** runtime **Python**, agent **HÉRAUT** (ex-HERMES), plateforme **Vapi**, modèle vocal **Gemini Flash**.
