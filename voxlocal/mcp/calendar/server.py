"""MCP server: calendar.

Agenda à backend LOCAL (SQLite) en V1 ; Google Calendar/Outlook = backend ultérieur.
Garantit le garde-fou « disponibilité réelle uniquement » : l'agent ne peut réserver
qu'un créneau réellement libre (pas de double-réservation, pas de promesse en l'air).
Lancer : py mcp/calendar/server.py
"""
import os
import sqlite3
from datetime import datetime, timezone

from mcp.server.fastmcp import FastMCP

mcp = FastMCP("voxlocal-calendar")

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
DB = os.environ.get("VOXLOCAL_CALENDAR_DB") or os.path.join(ROOT, "data", "calendar.sqlite3")


def _conn():
    os.makedirs(os.path.dirname(DB), exist_ok=True)
    c = sqlite3.connect(DB)
    c.row_factory = sqlite3.Row
    c.execute(
        """CREATE TABLE IF NOT EXISTS slots (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            start_iso TEXT UNIQUE,
            status TEXT DEFAULT 'free',
            client_name TEXT,
            created_at TEXT
        )"""
    )
    return c


@mcp.tool()
def add_slot(start_iso: str) -> dict:
    """Ajoute un créneau disponible (format ISO, ex. 2026-07-02T09:00)."""
    with _conn() as c:
        try:
            cur = c.execute(
                "INSERT INTO slots (start_iso,status,created_at) VALUES (?,?,?)",
                (start_iso, "free", datetime.now(timezone.utc).isoformat()),
            )
            return {"id": cur.lastrowid, "start_iso": start_iso, "status": "free"}
        except sqlite3.IntegrityError:
            return {"error": "Créneau déjà existant"}


@mcp.tool()
def list_free_slots(limit: int = 10) -> list:
    """Liste les créneaux RÉELLEMENT libres (source de vérité pour l'agent)."""
    with _conn() as c:
        rows = c.execute(
            "SELECT id,start_iso FROM slots WHERE status='free' ORDER BY start_iso LIMIT ?", (limit,)
        ).fetchall()
        return [dict(r) for r in rows]


@mcp.tool()
def book_slot(start_iso: str, client_name: str) -> dict:
    """Réserve un créneau SEULEMENT s'il est libre. Sinon -> erreur (jamais de promesse)."""
    with _conn() as c:
        row = c.execute("SELECT id,status FROM slots WHERE start_iso=?", (start_iso,)).fetchone()
        if not row:
            return {"ok": False, "error": "Créneau inexistant — proposer un créneau de la liste libre."}
        if row["status"] != "free":
            return {"ok": False, "error": "Créneau déjà réservé — proposer un autre."}
        c.execute("UPDATE slots SET status='booked', client_name=? WHERE id=?", (client_name, row["id"]))
        return {"ok": True, "start_iso": start_iso, "client_name": client_name}


@mcp.tool()
def cancel_booking(start_iso: str) -> dict:
    """Annule une réservation et libère le créneau."""
    with _conn() as c:
        c.execute("UPDATE slots SET status='free', client_name=NULL WHERE start_iso=?", (start_iso,))
        return {"ok": True, "start_iso": start_iso, "status": "free"}


@mcp.tool()
def move_booking(old_start_iso: str, new_start_iso: str, client_name: str) -> dict:
    """Déplace une réservation vers un nouveau créneau libre."""
    res = book_slot(new_start_iso, client_name)
    if not res.get("ok"):
        return res
    cancel_booking(old_start_iso)
    return {"ok": True, "from": old_start_iso, "to": new_start_iso}


if __name__ == "__main__":
    mcp.run()
