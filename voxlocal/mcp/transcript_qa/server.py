"""MCP server: transcript-qa.

Analyse un transcript d'appel pour détecter les HALLUCINATIONS : tarifs/montants
énoncés par l'agent mais absents de la KB du client. Vérifie aussi l'annonce IA.
Produit un score de fiabilité. Cœur du garde-fou « zéro mensonge » côté QA.
Lancer : py mcp/transcript_qa/server.py
"""
import re

from mcp.server.fastmcp import FastMCP

mcp = FastMCP("voxlocal-transcript-qa")

PRICE_RE = re.compile(r"(\d+(?:[.,]\d+)?)\s*(?:€|euros?)", re.IGNORECASE)
DISCLOSURE_KEYWORDS = ["assistant virtuel", "intelligence artificielle", "assistant ia", " ia "]


def _prices(text: str) -> set:
    return {p.replace(",", ".") for p in PRICE_RE.findall(text or "")}


def _kb_prices(kb: dict) -> set:
    allowed = set()
    for v in (kb.get("tarifs") or {}).values():
        allowed |= _prices(str(v))
    return allowed


@mcp.tool()
def check_transcript(transcript: list, kb: dict) -> dict:
    """Analyse un transcript (liste de {role, text}) face à la KB.

    Détecte les tarifs énoncés par l'agent absents de la KB (hallucination),
    et vérifie l'annonce IA dans le premier tour de l'agent.
    Retourne un score de fiabilité /10 et la liste des alertes.
    """
    allowed = _kb_prices(kb)
    flags = []
    agent_turns = [t for t in transcript if t.get("role") == "agent"]

    # Annonce IA
    disclosure_ok = bool(agent_turns) and any(
        k in (agent_turns[0].get("text", "").lower()) for k in DISCLOSURE_KEYWORDS
    )
    if not disclosure_ok:
        flags.append({"type": "annonce_ia_manquante", "severite": "majeur"})

    # Tarifs inventés
    for t in agent_turns:
        for price in _prices(t.get("text", "")):
            if price not in allowed:
                flags.append(
                    {"type": "tarif_invente", "severite": "critique", "valeur": price, "extrait": t.get("text")}
                )

    score = 10
    for f in flags:
        score -= 4 if f["severite"] == "critique" else 2
    score = max(score, 0)

    return {
        "reliability_score": score,
        "disclosure_ok": disclosure_ok,
        "flags": flags,
        "verdict": "OK" if score >= 9 and not flags else "À CORRIGER",
    }


if __name__ == "__main__":
    mcp.run()
