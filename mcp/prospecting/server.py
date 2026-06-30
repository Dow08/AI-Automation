"""MCP server: prospecting.

Qualifie les prospects selon la grille ICP (volume × indisponibilité × ticket).
La COLLECTE (scrape Maps/Pages Jaunes) sera branchée ultérieurement ; ici on
expose la qualification, cœur réutilisable et testable.
Lancer : py mcp/prospecting/server.py
"""
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from common.icp import score_prospect, grid  # noqa: E402
from mcp.server.fastmcp import FastMCP  # noqa: E402

mcp = FastMCP("voxlocal-prospecting")


@mcp.tool()
def qualify(
    vertical: str,
    monthly_calls: int,
    missed_rate: float,
    ticket_value: float,
    recurring: bool = False,
    has_idle_secretary: bool = False,
) -> dict:
    """Score un prospect et rend un verdict (bon / nurture / ecarter).

    vertical : btp | sante | resto | autre
    monthly_calls : appels entrants estimés / mois
    missed_rate : % d'appels manqués
    ticket_value : valeur € d'un appel capté (devis/RDV)
    recurring : True si forte récurrence (LTV élevée)
    has_idle_secretary : True si une secrétaire dédiée non saturée existe déjà
    """
    return score_prospect(
        vertical, monthly_calls, missed_rate, ticket_value, recurring, has_idle_secretary
    )


@mcp.tool()
def qualify_batch(prospects: list) -> list:
    """Qualifie une liste de prospects (chaque item = dict d'arguments de qualify)."""
    out = []
    for p in prospects:
        res = score_prospect(
            p.get("vertical", "autre"),
            int(p.get("monthly_calls", 0)),
            float(p.get("missed_rate", 0)),
            float(p.get("ticket_value", 0)),
            bool(p.get("recurring", False)),
            bool(p.get("has_idle_secretary", False)),
        )
        res["name"] = p.get("name")
        out.append(res)
    return out


@mcp.tool()
def list_icp_grid() -> dict:
    """Retourne la grille ICP (pondération, verdicts, seuils, disqualifiants)."""
    return grid()


if __name__ == "__main__":
    mcp.run()
