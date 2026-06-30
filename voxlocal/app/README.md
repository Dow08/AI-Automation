# App web VoxLocal (FastAPI)

Onboarding self-service (collecte de la KB client) + tableau de bord. La fiche validée
alimente l'agent vocal (cf. `mcp/voxagent-config`).

## Installer & lancer
```powershell
py -m pip install fastapi "uvicorn[standard]" python-multipart
# depuis voxlocal/ :
py -m uvicorn app.main:app --reload
```
Puis ouvrir **http://127.0.0.1:8000**.

## Pages
- `/onboarding` — formulaire de fiche client → validée → prête à déployer.
- `/dashboard` — fiches clients, funnel CRM, créneaux libres, agents déployés.
- `/docs` — documentation API auto (Swagger).

## Données
- Fiches clients : `voxlocal/data/clients_kb.sqlite3` (ignoré par git).
- Le tableau de bord lit les backends locaux (crm, calendar, telephony).
