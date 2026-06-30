# Journal des frictions (vivant)

> Toute friction rencontrée est consignée ICI pour ne JAMAIS la re-découvrir. Tenu par CURATOR. Format : ajouter une ligne, ne jamais effacer (passer en statut Résolu).

| # | Date | Étape | Friction | Gravité | Statut | Traitement |
| :-: | :-- | :-- | :-- | :-: | :-- | :-- |
| F1 | 2026-06-30 | Archi | Agendas fermés (Doctolib, Zenchef) sans API tierce d'écriture | 🔴 | Contourné | V1 = agendas ouverts + fallback notif praticien |
| F2 | 2026-06-30 | Setup | Provisioning numéro FR exige justificatifs SIRET/adresse | 🟠 | Ouvert | Anticiper la paperasse dès la souscription |
| F3 | 2026-06-30 | Setup | Codes/coûts de renvoi d'appel variables par opérateur | 🟠 | Ouvert | Guide par opérateur (Orange/SFR/Free/Bouygues) dans l'onboarding |
| F4 | 2026-06-30 | Fonctionnement | Risque hallucination → churn immédiat | 🔴 | Maîtrisé | Garde-fou zéro-mensonge structurel + SENTINEL |
| F5 | 2026-06-30 | Conformité | Verticale santé = données sensibles | 🟠 | Ouvert | Démarrer BTP/bien-être ; santé après durcissement (AEGIS) |
| F6 | 2026-06-30 | Sécurité | Surface supply-chain (deps, secrets, dépendance white-label) | 🟠 | Maîtrisé | Hardening dès le build (AEGIS) |
| F7 | 2026-06-30 | Marché | Concurrence locale qui s'installe (Nerolia, etc.) | 🟠 | Suivi | Vitesse + hyper-niche géo/métier |
| F8 | 2026-06-30 | Acceptation | Clientèle âgée réfractaire au « robot » | 🟡 | À tester | Annonce honnête + transfert humain + ton chaleureux |
| F9 | 2026-06-30 | Légal | **On est SOUS-TRAITANT RGPD** des données du client (on traite ses appelants) → DPA obligatoire | 🔴 | Plan défini | DPA art.28 + résidence UE + rétention courte (standard processor) |
| F10 | 2026-06-30 | Légal | Consentement/information **enregistrement & transcription** d'appel (au-delà de l'annonce IA) | 🟠 | Ouvert | Phrase d'info en intro d'appel + mention dans CGV |
| F11 | 2026-06-30 | Légal | **Responsabilité** si l'IA donne une info erronée (qui paie ?) | 🔴 | Plan défini | CGV + limitation de responsabilité (plafond=frais) + KB validée par client + **RC Pro** + archi zéro-mensonge |
| F12 | 2026-06-30 | Sécurité | **Fraude télécom / toll fraud** (surtaxe) : risque financier réel | 🔴 | Maîtrisé | **Inbound-only** (petite surface) + Twilio Geo Permissions (bloque IRSF/premium) + plafond & alerte de coût PAR CLIENT |
| F13 | 2026-06-30 | Sécurité | **Prompt injection par l'appelant** (« ignore tes instructions ») | 🟠 | Ouvert | Garde-fous système + tests adverses (golden set) |
| F14 | 2026-06-30 | Sécurité | **Exfiltration** : l'IA ne doit jamais divulguer la KB complète / d'autres clients | 🟠 | Ouvert | Cloisonnement strict + filtre de sortie |
| F15 | 2026-06-30 | Ops | **Dégradation gracieuse** : si la stack tombe, jamais sonner dans le vide | 🔴 | Plan défini | Failover téléphonie : health-check + repli messagerie/mobile si stack down |
| F16 | 2026-06-30 | Ops | **Transfert humain « chaud »** techniquement non trivial | 🟠 | À valider | Vérifier le support du fournisseur tôt |
| F17 | 2026-06-30 | Ops | **Multi-tenant** : isolation stricte des données par client | 🟠 | Ouvert | Schéma DB cloisonné dès le départ |
| F18 | 2026-06-30 | Ops | **Observabilité** absente (taux décroché/escalade/RDV, coût/min par client) | 🟠 | Ouvert | Dashboard métriques = preuve ROI + détection dérive |
| F19 | 2026-06-30 | Ops | **Versionnement + rollback** des prompts/scripts par client | 🟡 | Ouvert | Historiser chaque config, rollback 1 clic |
| F20 | 2026-06-30 | Produit | **Formulaire d'onboarding** (collecte KB) + MAJ tarifs/horaires par le client | 🟠 | Ouvert | Sans lui, le zéro-mensonge n'a pas de données |
| F21 | 2026-06-30 | Produit | **Tableau de bord client** (voir appels/RDV) | 🟡 | Ouvert | Partie visible de l'app |
| F22 | 2026-06-30 | Process | **Golden test set** d'appels simulés par verticale (non-régression) | 🟠 | Ouvert | Base de tests avant toute mise en prod |
| F23 | 2026-06-30 | Légal | **Entité juridique requise** (SIRET) pour provisionner les numéros + signer DPA/CGV | 🟠 | Ouvert | Micro-entreprise suffit ; KBIS = société, auto-entrepreneur → procuration Twilio. À régler avant le 1er numéro |
| F24 | 2026-06-30 | Légal | **Prospection téléphonique sortante auto = encadrée** (B2C interdit opt-in dès 11/08/2026, B2B RGPD, sanctions ≤500k€) | 🟠 | Contourné | PAS de cold calling auto de masse. Canal = **cold email B2B opt-out** (légal) + **démo INBOUND** (le prospect appelle notre numéro) |

> **Synthèse viabilité (2026-06-30, vérifiée par recherche)** : projet NON « mort dans l'œuf ». AI Act = **risque LIMITÉ** (annonce IA + RGPD seulement ; high-risk repoussé à déc. 2027). Fraude télécom = petite surface (inbound). Provisioning FR = paperasse (KBIS/ID). Doctolib/Zenchef sans API publique → fallback notification. Tout le reste = ingénierie SaaS/télécom standard. Conditions : entité juridique, résidence UE, DPA+CGV+RC Pro, failover, discipline zéro-mensonge.

**Gravité :** 🔴 élevée · 🟠 moyenne · 🟡 faible. **Statut :** Ouvert / Maîtrisé / Contourné / Résolu / Suivi.
