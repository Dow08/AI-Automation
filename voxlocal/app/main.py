"""App web VoxLocal — onboarding self-service + tableau de bord.

Lancer (depuis voxlocal/) :
    py -m uvicorn app.main:app --reload
    (ou)  py app/main.py
"""
import importlib.util
import os
import sys

from fastapi import FastAPI, Form
from fastapi.responses import HTMLResponse

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)  # voxlocal/
sys.path.insert(0, HERE)
import onboarding_store as store  # noqa: E402


def _load(name):
    path = os.path.join(ROOT, "mcp", name, "server.py")
    spec = importlib.util.spec_from_file_location(f"vox_{name}", path)
    m = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(m)
    return m


crm = _load("crm")
cal = _load("calendar")
tel = _load("telephony")

app = FastAPI(title="VoxLocal")

PAGE = """<!doctype html><html lang=fr><head><meta charset=utf-8>
<meta name=viewport content="width=device-width,initial-scale=1"><title>VoxLocal</title>
<style>
body{{font-family:system-ui,sans-serif;max-width:680px;margin:2rem auto;padding:0 1rem;color:#1c1c1c}}
h1{{color:#15a06a}} label{{display:block;margin:.6rem 0 .2rem;font-weight:600}}
input,select{{width:100%;padding:.5rem;border:1px solid #ccc;border-radius:6px;box-sizing:border-box}}
button{{margin-top:1rem;padding:.6rem 1.2rem;background:#15a06a;color:#fff;border:0;border-radius:6px;font-size:1rem;cursor:pointer}}
.card{{border:1px solid #e3e3e3;border-radius:10px;padding:1rem;margin:.6rem 0}} a{{color:#15a06a}}
</style></head><body>{body}</body></html>"""


@app.get("/", response_class=HTMLResponse)
def home():
    body = (
        "<h1>VoxLocal</h1><p>Standard vocal IA pour TPE/PME.</p>"
        "<p><a href='/onboarding'>➕ Onboarding d'un client</a></p>"
        "<p><a href='/dashboard'>📊 Tableau de bord</a></p>"
    )
    return PAGE.format(body=body)


@app.get("/onboarding", response_class=HTMLResponse)
def onboarding_form():
    body = """<h1>Onboarding client</h1>
<form method=post action='/onboarding'>
<label>Nom de l'entreprise</label><input name=entreprise required>
<label>Verticale</label><select name=vertical>
<option value=btp>BTP</option><option value=sante>Santé / bien-être</option><option value=resto>Restauration</option></select>
<label>Métier</label><input name=metier placeholder='plombier, kiné, ...'>
<label>Horaires</label><input name=horaires placeholder='Lun-Ven 8h-18h'>
<label>Zone d'intervention</label><input name=zone_intervention placeholder='Rodez et 30 km'>
<label>Prestations (séparées par des virgules)</label><input name=prestations placeholder='dépannage, installation, devis'>
<label>Tarif déplacement (optionnel)</label><input name=tarif_deplacement placeholder='50€'>
<button type=submit>Créer la fiche</button>
</form>"""
    return PAGE.format(body=body)


@app.post("/onboarding", response_class=HTMLResponse)
def onboarding_submit(
    entreprise: str = Form(...),
    vertical: str = Form("btp"),
    metier: str = Form(""),
    horaires: str = Form(""),
    zone_intervention: str = Form(""),
    prestations: str = Form(""),
    tarif_deplacement: str = Form(""),
):
    kb = {
        "entreprise": entreprise,
        "metier": metier,
        "horaires": {"texte": horaires} if horaires else {},
        "zone_intervention": zone_intervention,
        "prestations": [p.strip() for p in prestations.split(",") if p.strip()],
        "tarifs": {"deplacement": tarif_deplacement} if tarif_deplacement else {},
    }
    res = store.save_client_kb(entreprise, vertical, kb)
    if res["ready"]:
        status = "<p style='color:#15a06a'>✅ Fiche complète — l'agent peut être déployé.</p>"
    else:
        status = f"<p style='color:#b30000'>⚠ Champs manquants : {', '.join(res['missing'])}</p>"
    body = (
        f"<h1>Fiche enregistrée (#{res['id']})</h1>{status}"
        "<p><a href='/onboarding'>Nouvelle fiche</a> · <a href='/dashboard'>Tableau de bord</a></p>"
    )
    return PAGE.format(body=body)


@app.get("/dashboard", response_class=HTMLResponse)
def dashboard():
    funnel = crm.funnel_stats()
    body = (
        "<h1>Tableau de bord</h1>"
        f"<div class=card><b>Fiches clients :</b> {len(store.list_clients())}</div>"
        f"<div class=card><b>Funnel CRM :</b> {funnel or 'vide'}</div>"
        f"<div class=card><b>Créneaux libres :</b> {len(cal.list_free_slots())}</div>"
        f"<div class=card><b>Agents déployés :</b> {len(tel.list_agents())}</div>"
        "<p><a href='/'>← Accueil</a></p>"
    )
    return PAGE.format(body=body)


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="127.0.0.1", port=8000)
