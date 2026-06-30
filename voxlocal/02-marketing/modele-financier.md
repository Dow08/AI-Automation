# Modèle financier VoxLocal (chiffres vérifiés, honnêtes)

> ⚠️ Corrige les estimations trop optimistes antérieures (0,12 €/min, marge 83 %). Données vérifiées 2026.

## Hypothèses vérifiées
- Coût voix tout compris (orchestration + STT + LLM + TTS + téléphonie) : **~0,18-0,22 €/min** (Vapi/Retell all-in, PAS le tarif d'appel affiché).
- Cotisations micro-entreprise BNC (non-CIPAV) 2026 : **25,6 % du CA**.
- Plafond micro prestations de services 2026 : **83 600 €/an** (→ ~45-46 clients max avant de passer en société).
- Prix : 299 € setup · 149 €/mois (200 min incluses) · overage 0,30 €/min.

## Unit economics par client/mois
| Ligne | Montant |
| :-- | --: |
| Revenu | 149 € |
| – COGS voix (~150-200 min × 0,20 €) + numéro | ~38 € |
| = Marge brute | ~111 € (74 %) |
| – Cotisations URSSAF (25,6 %) | ~38 € |
| = **Net avant IR** | **~73 €** (71 € gros user / 93 € petit user) |

Setup 299 € → **~222 € net** one-time par signature. Overage 0,30 € (coût 0,20 €) = margé. **Le cap 200 min est le garde-fou de marge.**

## Scénarios (net mensuel récurrent, avant IR perso ; fixes ~47 €/mois)
| Clients | CA annuel | Net mensuel | Note |
| :-: | :-: | :-: | :-- |
| 10 | ~17,9 k€ | ~800 € | + setups |
| 30 | ~53,6 k€ | ~2 400 € | revenu solo réel |
| ~45 | ~80,5 k€ | ~3 550 € | **plafond micro** → société au-delà |

## Investissement vs retour
- Cash à engager : **quasi nul** (build OSS = 0 €, COGS payés après encaissement client). Fixes < 500 €/an (RC Pro ~300 €/an + VPS + domaine).
- **Break-even cash dès le client n°1.** Le vrai investissement = le **temps** (build + acquisition).
- Risque financier ≈ nul · ROI cash énorme · ROI temps = variable réelle.

## Ce qui décide de la rentabilité
Pas l'unit economics (sain à 74 %). Mais : (1) **vitesse d'acquisition** (1-2 clients/sem via mirror demo) et (2) **churn** (garde-fou zéro-mensonge + pilote-preuve).

## Leviers d'amélioration
- Annuel prépayé (12 mois ≈ prix de 10-11) → ↓ churn + trésorerie.
- Option « Lite » after-hours 89 €/100 min pour petits volumes.
- Upsell avis/SEO local plus tard (+MRR sans CAC).

## Verdict
**Rentabilité 8/10 → GO.** Rentable avec risque financier quasi nul ; net réaliste 2-3,5 k€/mois en solo, plafonné par la micro-entreprise (bon problème).
