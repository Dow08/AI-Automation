# Ops & maintenance automatisées (prévues dès le départ)

> Objectif : le système tourne seul ; seules les vraies pannes/incidents remontent au fondateur.

## Surveillance & auto-réparation
- **Monitoring 24/7** (SENTINEL + observabilité) : taux de décroché, latence, flags d'hallucination, pics d'escalade, coût/min par client. Alerte uniquement sur seuil anormal.
- **Auto-healing / dégradation gracieuse** (F15) : stack down → failover messagerie/mobile + alerte.
- **Garde-fou anti-fraude télécom** (F12) : plafond + alerte de coût PAR client ; blocage destinations premium/international.

## Qualité & mise en prod
- **QA auto** : golden test set rejoué à chaque changement de config/prompt.
- **Gate WARDEN ≥ 9/10** obligatoire avant toute mise en prod.
- **Versionnement + rollback** des prompts/scripts par client.

## Support & facturation
- **Support à étages** : FAQ/aide auto pour les clients + status page ; escalade vers le fondateur seulement en incident réel.
- **Facturation auto** (Stripe/Lago) : MRR, metering overage, relances d'échec de paiement. Zéro facture manuelle.
- **Dashboard client self-service** : le client gère SON contenu (horaires/tarifs/FAQ) → pas de maintenance fondateur.

## Temps fondateur résiduel (minimisé)
- Closing des 3-5 premiers pilotes (puis self-serve).
- Incidents réels rares.
- Décisions stratégiques (prix, nouvelle verticale).
Tout le reste est automatisé.
