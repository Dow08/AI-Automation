"""Stockage des fiches client (KB) collectées à l'onboarding self-service.

La KB validée alimente l'agent vocal (cf. mcp/voxagent-config). Backend SQLite local.
"""
import json
import os
import sqlite3
from datetime import datetime, timezone

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))  # .../voxlocal/
DB = os.environ.get("VOXLOCAL_CLIENTS_DB") or os.path.join(ROOT, "data", "clients_kb.sqlite3")
TEMPLATES = os.path.join(ROOT, "templates")

# À garder en phase avec mcp/voxagent_config (REQUIRED_KB).
REQUIRED = {
    "btp": ["entreprise", "metier", "horaires", "zone_intervention", "prestations"],
    "sante": ["entreprise", "metier", "horaires", "prestations"],
    "resto": ["entreprise", "horaires", "prestations"],
}


def _conn():
    os.makedirs(os.path.dirname(DB), exist_ok=True)
    c = sqlite3.connect(DB)
    c.row_factory = sqlite3.Row
    c.execute(
        """CREATE TABLE IF NOT EXISTS clients_kb (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT, vertical TEXT, kb_json TEXT, created_at TEXT
        )"""
    )
    return c


def validate(vertical: str, kb: dict) -> list:
    """Retourne la liste des champs obligatoires manquants."""
    return [f for f in REQUIRED.get(vertical.lower(), []) if not kb.get(f)]


def save_client_kb(name: str, vertical: str, kb: dict) -> dict:
    """Enregistre la fiche client. Retourne id + champs manquants + statut prêt."""
    missing = validate(vertical, kb)
    with _conn() as c:
        cur = c.execute(
            "INSERT INTO clients_kb (name,vertical,kb_json,created_at) VALUES (?,?,?,?)",
            (name, vertical, json.dumps(kb, ensure_ascii=False), datetime.now(timezone.utc).isoformat()),
        )
        return {"id": cur.lastrowid, "ready": not missing, "missing": missing}


def get_client_kb(client_id: int) -> dict:
    with _conn() as c:
        r = c.execute("SELECT * FROM clients_kb WHERE id=?", (client_id,)).fetchone()
        if not r:
            return {"error": "introuvable"}
        return {"id": r["id"], "name": r["name"], "vertical": r["vertical"], "kb": json.loads(r["kb_json"])}


def list_clients() -> list:
    with _conn() as c:
        return [
            {"id": r["id"], "name": r["name"], "vertical": r["vertical"]}
            for r in c.execute("SELECT id,name,vertical FROM clients_kb ORDER BY id").fetchall()
        ]


def build_config(client_id: int) -> dict:
    """Fusionne la KB du client dans le template de sa verticale. Prêt si ready=True."""
    rec = get_client_kb(client_id)
    if "error" in rec:
        return rec
    path = os.path.join(TEMPLATES, rec["vertical"].lower(), "template.json")
    with open(path, encoding="utf-8") as f:
        tpl = json.load(f)
    tpl["knowledge_base"] = {**tpl.get("knowledge_base", {}), **rec["kb"]}
    missing = validate(rec["vertical"], rec["kb"])
    return {"ready": not missing, "missing": missing, "config": tpl}
