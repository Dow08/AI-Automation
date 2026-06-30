"""MCP server: billing.

Comptage et facturation à backend LOCAL (SQLite) en V1 ; Stripe/Lago = ultérieur.
Forfait standard : setup 299 €, abo 149 €/mois (200 min incluses), overage 0,30 €/min.
Lancer : py mcp/billing/server.py
"""
import os
import sqlite3
from datetime import datetime, timezone

from mcp.server.fastmcp import FastMCP

mcp = FastMCP("voxlocal-billing")

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
DB = os.environ.get("VOXLOCAL_BILLING_DB") or os.path.join(ROOT, "data", "billing.sqlite3")

PLAN = {"base_eur": 149.0, "included_min": 200, "overage_eur": 0.30, "setup_eur": 299.0}


def _conn():
    os.makedirs(os.path.dirname(DB), exist_ok=True)
    c = sqlite3.connect(DB)
    c.row_factory = sqlite3.Row
    c.execute(
        """CREATE TABLE IF NOT EXISTS clients (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT, setup_paid INTEGER DEFAULT 0,
            period_minutes REAL DEFAULT 0, created_at TEXT
        )"""
    )
    return c


@mcp.tool()
def add_client(name: str) -> dict:
    """Crée un client (setup non encore payé)."""
    with _conn() as c:
        cur = c.execute(
            "INSERT INTO clients (name,created_at) VALUES (?,?)",
            (name, datetime.now(timezone.utc).isoformat()),
        )
        return {"id": cur.lastrowid, "name": name}


@mcp.tool()
def record_minutes(client_id: int, minutes: float) -> dict:
    """Ajoute des minutes consommées sur la période en cours."""
    with _conn() as c:
        c.execute("UPDATE clients SET period_minutes=period_minutes+? WHERE id=?", (minutes, client_id))
        row = c.execute("SELECT period_minutes FROM clients WHERE id=?", (client_id,)).fetchone()
        return {"client_id": client_id, "period_minutes": row["period_minutes"] if row else None}


@mcp.tool()
def mark_setup_paid(client_id: int) -> dict:
    """Marque les frais de mise en service comme payés."""
    with _conn() as c:
        c.execute("UPDATE clients SET setup_paid=1 WHERE id=?", (client_id,))
        return {"client_id": client_id, "setup_paid": True}


@mcp.tool()
def reset_period(client_id: int) -> dict:
    """Réinitialise le compteur de minutes (nouveau mois)."""
    with _conn() as c:
        c.execute("UPDATE clients SET period_minutes=0 WHERE id=?", (client_id,))
        return {"client_id": client_id, "period_minutes": 0}


@mcp.tool()
def compute_invoice(client_id: int) -> dict:
    """Calcule la facture du mois (setup si dû + abo + overage)."""
    with _conn() as c:
        r = c.execute("SELECT * FROM clients WHERE id=?", (client_id,)).fetchone()
        if not r:
            return {"error": "client introuvable"}
        used = r["period_minutes"]
        overage_min = max(0.0, used - PLAN["included_min"])
        overage = round(overage_min * PLAN["overage_eur"], 2)
        setup = 0.0 if r["setup_paid"] else PLAN["setup_eur"]
        total = round(PLAN["base_eur"] + overage + setup, 2)
        return {
            "client": r["name"],
            "abonnement": PLAN["base_eur"],
            "minutes_incluses": PLAN["included_min"],
            "minutes_utilisees": used,
            "overage_minutes": overage_min,
            "overage_eur": overage,
            "setup_eur": setup,
            "total_eur": total,
        }


if __name__ == "__main__":
    mcp.run()
