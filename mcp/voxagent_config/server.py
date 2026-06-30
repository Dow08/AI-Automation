"""MCP server: voxagent-config.

Charge un template de verticale, fusionne la base de connaissance (KB) du client,
valide les champs requis et applique le garde-fou « zéro mensonge » :
l'IA ne répond QUE si l'info est présente dans la KB, sinon -> escalade.
Lancer : py mcp/voxagent_config/server.py
"""
import json
import os

from mcp.server.fastmcp import FastMCP

mcp = FastMCP("voxlocal-voxagent-config")

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
TEMPLATES = os.path.join(ROOT, "templates")

# Champs de KB obligatoires par verticale (sans eux, trop d'escalades).
REQUIRED_KB = {
    "btp": ["entreprise", "metier", "horaires", "zone_intervention", "prestations"],
    "sante": ["entreprise", "metier", "horaires", "prestations"],
    "resto": ["entreprise", "horaires", "prestations"],
}


def _load(vertical: str) -> dict:
    path = os.path.join(TEMPLATES, vertical.lower(), "template.json")
    with open(path, encoding="utf-8") as f:
        return json.load(f)


@mcp.tool()
def load_template(vertical: str) -> dict:
    """Charge le template brut d'une verticale (btp | sante | resto)."""
    try:
        return _load(vertical)
    except FileNotFoundError:
        return {"error": f"Template introuvable pour la verticale '{vertical}'."}


@mcp.tool()
def validate_kb(vertical: str, client_kb: dict) -> dict:
    """Vérifie que les champs KB obligatoires sont remplis pour la verticale."""
    required = REQUIRED_KB.get(vertical.lower(), [])
    missing = [f for f in required if not client_kb.get(f)]
    return {"vertical": vertical, "ok": not missing, "missing": missing, "required": required}


@mcp.tool()
def build_agent_config(vertical: str, client_kb: dict) -> dict:
    """Fusionne la KB client dans le template et valide. Prêt à déployer si ok=True."""
    tpl = _load(vertical)
    val = validate_kb(vertical, client_kb)
    tpl["knowledge_base"] = {**tpl.get("knowledge_base", {}), **client_kb}
    return {"vertical": vertical, "ready": val["ok"], "missing": val["missing"], "config": tpl}


@mcp.tool()
def guardrail_check(vertical: str, client_kb: dict, requested_info: str) -> dict:
    """Garde-fou zéro-mensonge : l'info demandée est-elle dans la KB ?

    Retourne action = 'answer' (présente) ou 'escalate' (absente -> ne pas inventer).
    """
    present = bool(client_kb.get(requested_info))
    return {
        "requested_info": requested_info,
        "in_kb": present,
        "action": "answer" if present else "escalate",
        "rationale": "Présent dans la KB" if present else "Absent de la KB -> escalade, ne jamais inventer",
    }


if __name__ == "__main__":
    mcp.run()
