# Démo — simulation d'appel bout-en-bout

Prouve que le « cerveau » de VoxLocal fonctionne **sans aucun compte payant**, en orchestrant les MCP locaux.

## Lancer
```powershell
py voxlocal/demo/simulate_call.py
```

## Ce que ça démontre
- **Appel A (RDV)** : l'IA annonce qu'elle est une IA, propose un **créneau réellement libre** (mcp-calendar), réserve, enregistre le lead (mcp-crm), compte la consommation (mcp-billing). QA = 10/10.
- **Appel B (tarif hors KB)** : l'info n'est pas dans la base → **escalade** + notification dirigeant (jamais d'invention). QA = 10/10.
- **Contre-exemple** : si l'agent inventait un prix, **mcp-transcript-qa le détecte** (flag critique).

## MCP utilisés
voxagent-config · calendar · crm · billing · transcript-qa.

> Les bases SQLite de démo sont écrites dans `voxlocal/data/` (ignoré par git) et réinitialisées à chaque exécution.
