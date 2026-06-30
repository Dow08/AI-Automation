"""MCP server: crm.

Stockage local (SQLite, sans compte) des prospects/clients et de leur statut
dans le funnel. Migration vers Supabase prévue en phase ultérieure.
Statuts : prospect -> demo_envoyee -> pilote -> client -> perdu.
Lancer : py mcp/crm/server.py
"""
import os
import sqlite3
from datetime import datetime, timezone

from mcp.server.fastmcp import FastMCP

mcp = FastMCP("voxlocal-crm")

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
DB = os.environ.get("VOXLOCAL_CRM_DB") or os.path.join(ROOT, "data", "crm.sqlite3")
STATUSES = ["prospect", "demo_envoyee", "pilote", "client", "perdu"]


def _conn():
    os.makedirs(os.path.dirname(DB), exist_ok=True)
    c = sqlite3.connect(DB)
    c.row_factory = sqlite3.Row
    c.execute(
        """CREATE TABLE IF NOT EXISTS prospects (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT, vertical TEXT, phone TEXT,
            score INTEGER, verdict TEXT, status TEXT, created_at TEXT
        )"""
    )
    return c


@mcp.tool()
def add_prospect(name: str, vertical: str, phone: str = "", score: int = 0, verdict: str = "") -> dict:
    """Ajoute un prospect (statut initial 'prospect')."""
    with _conn() as c:
        cur = c.execute(
            "INSERT INTO prospects (name,vertical,phone,score,verdict,status,created_at) VALUES (?,?,?,?,?,?,?)",
            (name, vertical, phone, score, verdict, "prospect", datetime.now(timezone.utc).isoformat()),
        )
        return {"id": cur.lastrowid, "name": name, "status": "prospect"}


@mcp.tool()
def list_prospects(status: str = "") -> list:
    """Liste les prospects, filtrable par statut."""
    with _conn() as c:
        if status:
            rows = c.execute("SELECT * FROM prospects WHERE status=? ORDER BY id", (status,)).fetchall()
        else:
            rows = c.execute("SELECT * FROM prospects ORDER BY id").fetchall()
        return [dict(r) for r in rows]


@mcp.tool()
def update_status(prospect_id: int, status: str) -> dict:
    """Change le statut d'un prospect (prospect|demo_envoyee|pilote|client|perdu)."""
    if status not in STATUSES:
        return {"error": f"Statut invalide. Valides: {STATUSES}"}
    with _conn() as c:
        c.execute("UPDATE prospects SET status=? WHERE id=?", (status, prospect_id))
        return {"id": prospect_id, "status": status}


@mcp.tool()
def get_prospect(prospect_id: int) -> dict:
    """Récupère un prospect par id."""
    with _conn() as c:
        row = c.execute("SELECT * FROM prospects WHERE id=?", (prospect_id,)).fetchone()
        return dict(row) if row else {"error": "introuvable"}


@mcp.tool()
def funnel_stats() -> dict:
    """Compte les prospects par statut (vue funnel)."""
    with _conn() as c:
        rows = c.execute("SELECT status, COUNT(*) n FROM prospects GROUP BY status").fetchall()
        return {r["status"]: r["n"] for r in rows}


if __name__ == "__main__":
    mcp.run()
