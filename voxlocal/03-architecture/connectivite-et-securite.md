# Connectivité, raccordement & sécurité

## Raccordement à la ligne client (défaut V1 = renvoi d'appel)
| Méthode | Friction | Verdict |
| :-- | :-: | :-- |
| 🟢 **Renvoi d'appel conditionnel** (garde n°+opérateur, renvoi non-réponse/occupé vers DID provisionné, ex. `**61*<n°>#`) | Très faible | **DÉFAUT** : universel, réversible |
| 🟡 Numéro dédié affiché (après-heures / 2e ligne) | Faible | Complément |
| 🟠 SIP trunk (client VoIP/IPBX type 3CX) | Moyenne | Si déjà équipé |
| 🔴 Portabilité du numéro | Élevée | **À éviter V1** |

## Garde-fou « ZÉRO MENSONGE » (structurel)
- Base de connaissance **vérifiée par client** (horaires/adresse/prestations/**tarifs**/délais/secteur). L'IA ne répond QUE depuis cette base.
- **Tarifs figés, jamais générés.** Hors base → ne pas inventer.
- **Disponibilité = vérité du calendrier** : lire l'agenda réel AVANT de confirmer.
- Hors compétence/incertain → **escalade temps réel** : « je transmets à [entreprise] qui vous recontacte » + **notif immédiate au dirigeant** (SMS/WhatsApp/email) avec question + coordonnées. Confirmation envoyée au client.
- L'IA **annonce qu'elle est une IA** (AI Act art.50). Transfert humain possible.
- → Soit factuelle, soit elle passe la main. **Jamais entre les deux.**

## Sécurité / supply-chain (rôle AEGIS)
- Coffre à secrets (Vault/Doppler OSS), scopes API **least-privilege**, zéro clé en clair.
- Dépendances **minimales** + versions **épinglées** + SBOM + audit auto.
- Transcripts = données perso → **résidence UE**, rétention courte, chiffrement.
- Dépendance plateforme white-label → fournisseur SOC2/ISO, documentée.
- OAuth agenda → scopes minimaux (lire dispo + écrire RDV), révocable.
