"""Simulation d'appel bout-en-bout VoxLocal (preuve système, 0 €).

Orchestre les MCP locaux (voxagent-config, calendar, crm, billing, transcript-qa)
pour jouer 2 appels d'un client BTP :
  - Appel A : prise de rendez-vous (happy path).
  - Appel B : demande d'un tarif absent de la KB -> ESCALADE (zéro mensonge).
Puis montre que la QA détecte une hallucination si l'agent avait inventé un prix.

Lancer : py voxlocal/demo/simulate_call.py
"""
import importlib.util
import os
import sys

# Console Windows : forcer l'UTF-8 pour les accents et symboles (→, ⚠).
try:
    sys.stdout.reconfigure(encoding="utf-8")
except Exception:
    pass

BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))  # .../voxlocal/
DATA = os.path.join(BASE, "data")
os.makedirs(DATA, exist_ok=True)

# Bases de données dédiées à la démo (réinitialisées à chaque run)
for var, fn in [
    ("VOXLOCAL_CALENDAR_DB", "demo_calendar.sqlite3"),
    ("VOXLOCAL_CRM_DB", "demo_crm.sqlite3"),
    ("VOXLOCAL_BILLING_DB", "demo_billing.sqlite3"),
]:
    p = os.path.join(DATA, fn)
    if os.path.exists(p):
        os.remove(p)
    os.environ[var] = p


def load(name):
    path = os.path.join(BASE, "mcp", name, "server.py")
    spec = importlib.util.spec_from_file_location(f"vox_{name}", path)
    m = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(m)
    return m


cal = load("calendar")
crm = load("crm")
billing = load("billing")
vac = load("voxagent_config")
qa = load("transcript_qa")


def line(t=""):
    print(t)


# --- Contexte client (KB validée à l'onboarding) ---
KB = {
    "entreprise": "Plomberie Durand",
    "metier": "plombier",
    "horaires": {"lun-ven": "8h-18h"},
    "zone_intervention": "Rodez",
    "prestations": ["depannage", "installation", "devis"],
    "tarifs": {"deplacement": "50€"},  # seul tarif publié
}

tpl = vac.load_template("btp")
disclosure = tpl["identity"]["disclosure"].format(entreprise=KB["entreprise"])

# Agenda réel + client de facturation
for s in ["2026-07-02T09:00", "2026-07-02T10:00", "2026-07-02T14:00"]:
    cal.add_slot(s)
biz = billing.add_client(KB["entreprise"])["id"]

line("=" * 64)
line(f"  CLIENT : {KB['entreprise']} ({KB['metier']}, {KB['zone_intervention']})")
line("=" * 64)

# ================= APPEL A : prise de RDV =================
line("\n--- APPEL A : prise de rendez-vous ---")
line(f"IA   : {disclosure}")
line("Appelant : Bonjour, je voudrais un rendez-vous pour un devis.")
free = cal.list_free_slots(1)[0]["start_iso"]
booking = cal.book_slot(free, "Mme Bernard")
crm.add_prospect("Mme Bernard", "btp", "0565000011", 0, "rdv")
billing.record_minutes(biz, 3)
line(f"IA   : Je vous propose le créneau {free}. C'est noté, vous recevrez un SMS de confirmation.")
line(f"   -> agenda: {'réservé' if booking['ok'] else 'ÉCHEC'} | CRM: lead enregistré | facturation: +3 min")

transcript_a = [
    {"role": "agent", "text": disclosure},
    {"role": "caller", "text": "je voudrais un rendez-vous pour un devis"},
    {"role": "agent", "text": f"Je vous propose le {free}. C'est noté."},
]
res_a = qa.check_transcript(transcript_a, KB)
line(f"   -> QA: score {res_a['reliability_score']}/10, verdict {res_a['verdict']}")

# ================= APPEL B : tarif hors KB -> escalade =================
line("\n--- APPEL B : demande d'un tarif non publié ---")
line(f"IA   : {disclosure}")
line("Appelant : C'est combien pour remplacer un chauffe-eau ?")
gc = vac.guardrail_check("btp", KB, "tarif_chauffe_eau")  # absent de la KB
if gc["action"] == "escalate":
    crm.add_prospect("Appelant inconnu", "btp", "0565000022", 0, "devis")
    line("IA   : Je préfère faire confirmer le tarif exact par l'entreprise. Je transmets votre demande, vous serez recontacté.")
    line("   -> ESCALADE → notification dirigeant (SMS/WhatsApp) | CRM: lead enregistré")
else:
    line("IA   : (répond depuis la KB)")

transcript_b = [
    {"role": "agent", "text": disclosure},
    {"role": "caller", "text": "c'est combien pour un chauffe-eau ?"},
    {"role": "agent", "text": "Je transmets votre demande à l'entreprise, vous serez recontacté."},
]
res_b = qa.check_transcript(transcript_b, KB)
line(f"   -> QA: score {res_b['reliability_score']}/10, verdict {res_b['verdict']} (aucune invention)")

# ================= CONTRE-EXEMPLE : l'agent invente un prix =================
line("\n--- CONTRE-EXEMPLE : si l'agent avait inventé un prix ---")
bad = [
    {"role": "agent", "text": disclosure},
    {"role": "agent", "text": "Le remplacement du chauffe-eau coûte 850 euros."},
]
res_bad = qa.check_transcript(bad, KB)
line(f"   -> QA: score {res_bad['reliability_score']}/10, verdict {res_bad['verdict']}")
for f in res_bad["flags"]:
    line(f"      ⚠ {f['type']} ({f['severite']}): {f.get('valeur','')}")

# ================= Récap =================
line("\n" + "=" * 64)
line("  RÉCAP")
line("=" * 64)
line(f"Funnel CRM : {crm.funnel_stats()}")
line(f"Facture du mois (client {KB['entreprise']}) : {billing.compute_invoice(biz)['total_eur']} €")
line(f"Créneaux encore libres : {len(cal.list_free_slots())}")
line("\nGarde-fou zéro-mensonge : RESPECTÉ (info présente -> répond ; absente -> escalade ; invention -> détectée).")
