"""MCP server: compliance.

Vérifie la conformité d'un agent : annonce IA (AI Act art.50), notice
d'enregistrement, et fournit une checklist RGPD. Logique testable sans API.
Lancer : py mcp/compliance/server.py
"""
import json
import os

from mcp.server.fastmcp import FastMCP

mcp = FastMCP("voxlocal-compliance")

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
TEMPLATES = os.path.join(ROOT, "templates")

DISCLOSURE_KEYWORDS = ["assistant virtuel", "intelligence artificielle", "assistant ia", " ia "]
RECORDING_KEYWORDS = ["enregistr"]


def _has_kw(text: str, kws) -> bool:
    t = (text or "").lower()
    return any(k in t for k in kws)


@mcp.tool()
def check_ai_disclosure(text: str) -> dict:
    """Vérifie qu'un texte annonce clairement l'IA (AI Act art.50)."""
    ok = _has_kw(text, DISCLOSURE_KEYWORDS)
    return {"ai_disclosure": ok, "rationale": "Annonce IA présente" if ok else "Aucune annonce IA détectée"}


@mcp.tool()
def check_template_compliance(vertical: str) -> dict:
    """Charge un template et vérifie annonce IA + notice d'enregistrement."""
    path = os.path.join(TEMPLATES, vertical.lower(), "template.json")
    try:
        with open(path, encoding="utf-8") as f:
            tpl = json.load(f)
    except FileNotFoundError:
        return {"error": f"Template introuvable: {vertical}"}
    identity = tpl.get("identity", {})
    disclosure_ok = _has_kw(identity.get("disclosure", ""), DISCLOSURE_KEYWORDS)
    recording_ok = _has_kw(identity.get("recording_notice", ""), RECORDING_KEYWORDS)
    return {
        "vertical": vertical,
        "ai_disclosure": disclosure_ok,
        "recording_notice": recording_ok,
        "compliant": disclosure_ok and recording_ok,
    }


@mcp.tool()
def compliance_checklist() -> list:
    """Checklist conformité (auto = vérifiable par code, manuel = action humaine)."""
    return [
        {"item": "Annonce IA en début d'appel (AI Act art.50)", "type": "auto"},
        {"item": "Notice d'enregistrement d'appel", "type": "auto"},
        {"item": "DPA signé avec le client (sous-traitance)", "type": "manuel"},
        {"item": "Résidence des données en UE", "type": "manuel"},
        {"item": "Lien de désinscription dans chaque cold email", "type": "manuel"},
        {"item": "Données de santé évitées tant que stack non durcie", "type": "manuel"},
    ]


if __name__ == "__main__":
    mcp.run()
