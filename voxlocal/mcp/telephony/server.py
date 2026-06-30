"""MCP server: telephony.

Couche transport téléphonique (numéros, agents déployés, comptage).
MODE MOCK par défaut : tant que VAPI_API_KEY n'est pas défini, aucun appel réel —
on peut câbler et tester tout le pipeline à 0 €. Quand la clé Vapi est présente,
le chemin réel (provisioning + déploiement Vapi) sera implémenté.
Lancer : py mcp/telephony/server.py
"""
import os
import sqlite3
import uuid
from datetime import datetime, timezone

from mcp.server.fastmcp import FastMCP

mcp = FastMCP("voxlocal-telephony")

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
DB = os.environ.get("VOXLOCAL_TELEPHONY_DB") or os.path.join(ROOT, "data", "telephony.sqlite3")
TEMPLATES = os.path.join(ROOT, "templates")
MOCK = not os.environ.get("VAPI_API_KEY")


def _conn():
    os.makedirs(os.path.dirname(DB), exist_ok=True)
    c = sqlite3.connect(DB)
    c.row_factory = sqlite3.Row
    c.execute(
        """CREATE TABLE IF NOT EXISTS agents (
            id TEXT PRIMARY KEY, name TEXT, vertical TEXT,
            number TEXT, minutes REAL DEFAULT 0, created_at TEXT
        )"""
    )
    return c


@mcp.tool()
def mode() -> dict:
    """Indique si on est en mode mock (sans Vapi) ou réel (clé présente)."""
    return {"mock": MOCK, "note": "Mode mock tant que VAPI_API_KEY absent — aucun appel réel."}


@mcp.tool()
def provision_number(country: str = "FR") -> dict:
    """Obtient un numéro. En mock : numéro fictif. En réel : à brancher sur Vapi/Twilio."""
    if MOCK:
        suffix = uuid.uuid4().int % 1000000
        return {"mock": True, "number": f"+339{suffix:06d}", "country": country}
    return {"mock": False, "todo": "Provisioning Vapi/Twilio réel à implémenter (clé détectée)."}


@mcp.tool()
def deploy_agent(name: str, vertical: str, number: str = "") -> dict:
    """Déploie un agent pour une verticale (vérifie que le template existe)."""
    tpl = os.path.join(TEMPLATES, vertical.lower(), "template.json")
    if not os.path.isfile(tpl):
        return {"error": f"Template absent pour la verticale '{vertical}'."}
    agent_id = str(uuid.uuid4())
    with _conn() as c:
        c.execute(
            "INSERT INTO agents (id,name,vertical,number,created_at) VALUES (?,?,?,?,?)",
            (agent_id, name, vertical, number, datetime.now(timezone.utc).isoformat()),
        )
    return {"agent_id": agent_id, "name": name, "vertical": vertical, "number": number, "mock": MOCK}


@mcp.tool()
def list_agents() -> list:
    """Liste les agents déployés."""
    with _conn() as c:
        return [dict(r) for r in c.execute("SELECT * FROM agents ORDER BY created_at").fetchall()]


@mcp.tool()
def record_call(agent_id: str, minutes: float) -> dict:
    """Enregistre la durée d'un appel sur un agent (alimente la facturation)."""
    with _conn() as c:
        c.execute("UPDATE agents SET minutes=minutes+? WHERE id=?", (minutes, agent_id))
        row = c.execute("SELECT minutes FROM agents WHERE id=?", (agent_id,)).fetchone()
        return {"agent_id": agent_id, "minutes_total": row["minutes"] if row else None}


@mcp.tool()
def get_usage(agent_id: str) -> dict:
    """Retourne le total de minutes consommées par un agent."""
    with _conn() as c:
        row = c.execute("SELECT name,minutes FROM agents WHERE id=?", (agent_id,)).fetchone()
        return dict(row) if row else {"error": "agent introuvable"}


if __name__ == "__main__":
    mcp.run()
