# VoxLocal — CONTEXTE PRINCIPAL (source de vérité)

> Document maître retraçant l'ENTIÈRETÉ du projet. Tout agent ou humain DOIT le lire avant d'agir. En cas de doute, c'est lui qui fait foi. Mis à jour à chaque étape.

## 1. Pitch
Réceptionniste vocal IA en marque blanche, revendu aux TPE/PME locales. On **revend de l'infra** (pas de R&D lourde). Modèle léger, multi-verticale (script par métier), FR d'abord puis multilingue (EN).

## 2. Règle d'or — ZÉRO HALLUCINATION
L'IA est **soit factuelle, soit elle passe la main**. Jamais entre les deux. Tarifs/horaires/dispo = données figées et vérifiées. Hors base ou incertain → escalade temps réel au dirigeant (SMS/WhatsApp) + « on vous recontacte ». Détail : [03-architecture/connectivite-et-securite.md](03-architecture/connectivite-et-securite.md).

## 3. Règle d'or — GATE PRODUCTION 9/10
Rien n'est mis en production sous **9/10**. L'agent **WARDEN** note chaque livrable (correction, anti-hallucination, sécurité, conformité, fiabilité). < 9 → itération obligatoire. Détail : [05-processus/gate-production.md](05-processus/gate-production.md).

## 4. Règle d'or — GATING FINANCIER 0-10
Aucun euro engagé sans ROI prouvé. 0-5 = non / 6-8 = optimiser en gratuit / 9-10 = dépense OK. Agent **LEDGER**. Détail : [05-processus/gating-financier.md](05-processus/gating-financier.md).

## 5. Arborescence du projet
```
voxlocal/
├── 00-CONTEXTE-PRINCIPAL.md      ← CE FICHIER (source de vérité)
├── README.md                     ← navigation
├── 01-cadrage/                   ← décisions verrouillées + grille ICP
├── 02-marketing/                 ← plan marketing + script mirror demo
├── 03-architecture/              ← stack OSS, MCP, connectivité, sécurité
├── 04-agents/                    ← flotte d'agents (noms, fonctions, skills)
├── 05-processus/                 ← gating financier, gate production, itération
└── 06-frictions/                 ← JOURNAL-FRICTIONS + REGISTRE-BUGS
```

## 6. État du projet (mis à jour 2026-06-30)
- ✅ Cadrage, marketing, architecture, agents, processus, ICP : DÉFINIS.
- ✅ Garde-fous (zéro-mensonge, gate 9/10, gating financier) : DÉFINIS.
- ⏳ Aucun code écrit (volontaire : validation vente AVANT build).
- ⏳ En attente du « on lance » pour démarrer P1 (validation vente).

## 7. Note projet actuelle
Fonctionnement 17/20 · Mise en place 15,5/20 · **Global ≈ 16,5/20** (GO conditionnel, dé-risqué).

## 8. Séquence
P0 cadrage (fait) → **P1 validation vente** (prochaine) → P2 MVP → P3 durcissement → P4 scale. Chaque phase = porte de validation humaine.
