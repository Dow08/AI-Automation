# Grille de qualification ICP (Ideal Customer Profile)

> Objectif : ne vendre QU'AUX prospects où le ROI est mathématiquement vrai. Vendre ailleurs = fabriquer du churn. Cette grille est appliquée par l'agent **PROSPECT** avant toute mirror demo.

## Principe : 3 conditions cumulatives
Un bon prospect coche les TROIS. Si une seule manque → écarter (ou nurture).
1. **Volume** d'appels entrants réel.
2. **Indisponibilité** : le gérant rate effectivement ses appels.
3. **Ticket / LTV** : un appel capté vaut assez pour rentabiliser 149 €/mois.

## Seuil de rentabilité de référence
Abo 149 €/mois → viser ≥ 3× = **~450 €/mois de CA récupéré** pour un ROI évident.

## Scoring prospect /10
- **Volume** (0-4) : <40 appels/mois = 0 · 40-60 = 2 · 60-100 = 3 · >100 = 4
- **Indisponibilité** (0-3) : <15 % manqués = 0 · 15-25 % = 2 · >25 % = 3
- **Ticket/LTV** (0-3) : faible = 1 · moyen = 2 · élevé/récurrent = 3
- **≥ 7/10 = bon prospect** (mirror demo) · 5-6 = nurture · <5 = écarter.

## Seuils par verticale

| Verticale | Volume min/mois | Manqués min | Ticket / LTV | Caveats |
| :-- | :-: | :-: | :-- | :-- |
| **BTP** (plombier, chauffagiste, électricien) | ≥ 60 | ≥ 25 % | Chantier ≥ 200 €, conv. devis ~30-40 % → 1 chantier récupéré = abo remboursé | Agenda Google = facile. **Verticale prioritaire** |
| **Santé / bien-être** (kiné, ostéo, esthétique) | ≥ 80 | ≥ 20 % | Séance 40-70 € mais récurrence forte → LTV élevée | Doctolib fermé → fallback notif. Données santé → conformité renforcée (AEGIS) |
| **Restauration** | ≥ 100 | ≥ 30 % | Table 4 couv. ~120-150 € ; valeur = couverts non perdus | Zenchef/TheFork fermés → fallback. Marges client serrées |

## Disqualifiants immédiats (écarter)
- < 40 appels entrants/mois (volume insuffisant).
- Secrétaire dédiée déjà en place et non saturée.
- Métier où l'appel est par nature complexe/émotionnel sans cas simples (ex : litige juridique).
- Clientèle massivement réfractaire à l'IA téléphonique (à tester, pas à présumer).

## Méthode de mesure (anti-hallucination commerciale)
On n'affirme pas le volume : on **vérifie** (test d'appel aux heures critiques → tombe sur répondeur = indisponibilité prouvée) et on le **prouve** au prospect via le **pilote 30 jours avec logs réels**.
