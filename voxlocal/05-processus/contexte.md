# 05 — Processus · contexte du dossier

**Rôle :** les règles qui gouvernent l'avancement et empêchent la dérive.

**Fichiers :**
- `gating-financier.md` — la règle 0-10 sur toute dépense (LEDGER).
- `gate-production.md` — la règle « rien en prod < 9/10 » + rubrique de notation (WARDEN) + boucle d'itération.

**Principe global :** chaque livrable passe 3 portes — **rentabilité** (LEDGER ≥9), **conformité/sécurité** (AEGIS OK), **production** (WARDEN ≥9). Échec d'une porte → itération, jamais de passage en force.
