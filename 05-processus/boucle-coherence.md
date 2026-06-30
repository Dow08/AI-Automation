# Boucle d'itération de cohérence (jusqu'à « fonctionnel »)

> Objectif : itérer jusqu'à ce que le projet soit cohérent et fonctionnel de bout en bout, avec le minimum de surfaces problématiques. Pilotée par ATLAS, archivée par CURATOR, validée par WARDEN.

## Cycle
```
1. INVENTAIRE   — lister tous les composants requis (MCP, agents, docs, légal, ops, sécu)
2. VÉRIFICATION — pour chacun : existe ? cohérent avec 00-CONTEXTE-PRINCIPAL ?
3. DÉTECTION    — contradictions, manques, hypothèses non validées
4. CONSIGNATION — tout écart → 06-frictions/JOURNAL-FRICTIONS (ou REGISTRE-BUGS)
5. CORRECTION   — combler/corriger, mettre à jour les contextes concernés
6. NOTATION     — WARDEN note la cohérence /10 (anti-hallucination, sécurité, conformité, complétude)
7. BOUCLE       — < 9/10 ou manque bloquant → retour étape 2. Sinon → composant « prêt »
```

## Critère d'arrêt (Definition of Done — V1)
La V1 est « fonctionnelle » quand TOUS ces points sont à ≥ 9/10 (WARDEN) :
- [ ] Flux d'appel complet testé sur le golden test set (par verticale)
- [ ] Garde-fou zéro-mensonge prouvé (aucune invention sur jeu de tests adverses)
- [ ] Escalade + notification dirigeant fonctionnelles
- [ ] Agenda : lecture dispo + pose RDV réelles
- [ ] Dégradation gracieuse en cas de panne
- [ ] Conformité : annonce IA, DPA, consentement enregistrement, résidence UE
- [ ] Sécurité : secrets, scopes minimaux, plafond anti-toll-fraud, anti-prompt-injection
- [ ] Observabilité : taux décroché/escalade/RDV + coût/min par client
- [ ] 0 bug 🔴/🟠 ouvert dans le registre

## Règle
Aucune avancée de phase tant qu'un manque bloquant subsiste. On préfère itérer que passer en force.
