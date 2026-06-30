# Gate de production 9/10 (agent WARDEN)

> Règle absolue : **rien n'est mis en production sous 9/10.** WARDEN note chaque livrable (code, MCP, script, intégration). < 9 → itération obligatoire. Aucun passage en force.

## Rubrique de notation (chaque critère /10, note finale = minimum des critères bloquants)
| Critère | Bloquant ? | Ce qu'on vérifie |
| :-- | :-: | :-- |
| **Correction** | Oui | Fait ce qui est attendu, testé, sans régression |
| **Anti-hallucination** | Oui | Garde-fou « zéro mensonge » respecté : factuel ou escalade, jamais d'invention |
| **Sécurité / supply-chain** | Oui | Secrets protégés, deps épinglées, résidence UE, scopes minimaux |
| **Conformité** | Oui | AI Act art.50 (annonce IA), RGPD |
| **Fiabilité** | Oui | Comportement stable sur cas limites, fallback testé |
| **Simplicité / légèreté** | Non | Pas de complexité inutile |

**Règle de calcul :** si UN critère bloquant est < 9 → livrable refusé. Note finale = min des critères bloquants.

## Boucle d'itération
```
Construire → SENTINEL/AEGIS testent → WARDEN note → 
   ≥9 ? ── oui → PRODUCTION (+ CURATOR archive)
        └─ non → consigner la cause dans 06-frictions → corriger → re-tester
```
On itère jusqu'à zéro surface problématique. Chaque échec est **répertorié** (journal frictions / registre bugs), jamais oublié.
