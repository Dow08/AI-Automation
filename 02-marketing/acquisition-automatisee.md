# Machine d'acquisition automatisée (product-led)

> Objectif : toucher un maximum de prospects avec un temps fondateur quasi nul. Conçue dans le cadre légal français (vérifié 2026).

## Cadre légal (dicte les canaux)
- **Cold email B2B = légal en opt-out** : lié à l'activité pro + expéditeur clair + lien de désinscription. Emails génériques (`contact@`) = pas données perso. → **Canal n°1.**
- **Démarchage téléphonique sortant = à éviter** : B2C interdit (opt-in) dès 11/08/2026 (fin de Bloctel) ; B2B encadré RGPD + horaires 10-13h/14-20h. Sanctions ≤ 500 k€. → **PAS de cold calling automatisé de masse.**
- **Principe gagnant** : on ne les appelle pas, **on les fait appeler notre numéro de démo** (inbound, légal, fort taux de conversion).

## Funnel automatisé
| # | Étape | Agent/MCP | Auto |
| :-: | :-- | :-- | :-: |
| 1 | Sourcing (scrape Maps/Pages Jaunes par métier×zone) | PROSPECT/mcp-prospecting | 100% |
| 2 | Qualification ICP via signaux (pas de résa en ligne, avis « jamais joignable », horaires) | PROSPECT | 100% |
| 3 | Génération démo perso (nom/horaires/services réels) | SCRIBE/mcp-voxagent-config | 100% |
| 4 | Cold email B2B opt-out + CTA « appelez ce numéro = VOTRE IA » + désinscription | HÉRAUT/n8n | 100% |
| 5 | Démo self-service inbound (prospect appelle, teste, l'IA propose l'activation + lien) | mcp-telephony | 100% |
| 6 | Closing self-serve (landing → Stripe ; ou Calendly 15 min) | mcp-billing | 90% |
| 7 | Onboarding self-serve (form KB → OAuth agenda → numéro → live) | RELAY/mcp-calendar | 80% |
| 8 | Boucle de référence (parrainage + témoignage auto post-pilote) | HÉRAUT | 100% |

## Compromis assumé
Cold email auto convertit ~1-3 % (vs ~30 % en personne) mais scale à zéro temps ; la **démo inbound personnalisée** compense par l'effet « wow ». Les **3-5 premiers pilotes** = closés en personne par Dorian (preuve sociale + objections), **puis full self-serve**.

## Rétention anti-churn auto
- **Rapport ROI mensuel auto** (« X appels captés ≈ Y € ») = la preuve qui retient.
- Détection de risque (usage faible/escalades) → relance auto.
- Dashboard client self-service (le client met à jour SON contenu).
- Facturation + relances Stripe automatiques.
