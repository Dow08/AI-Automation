"""MCP server: model-router.

Route chaque tâche vers le modèle optimal (économie de tokens).
Lancer : py mcp/model_router/server.py
"""
import os
import sys

# Permet d'importer le package `common` quel que soit le dossier de lancement.
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from common.models import route, policy  # noqa: E402
from mcp.server.fastmcp import FastMCP  # noqa: E402

mcp = FastMCP("voxlocal-model-router")


@mcp.tool()
def route_task(task_type: str, criticality: str = "normal") -> dict:
    """Conseille le modèle pour une tâche.

    task_type : scrape | bulk | draft | content | classify | voice_realtime |
                build | integration | code | architecture | security |
                compliance | guardrail | qa_critical
    criticality : low | normal | critical
    """
    return route(task_type, criticality)


@mcp.tool()
def list_routing_policy() -> dict:
    """Liste les modèles disponibles et la politique de routage."""
    return policy()


if __name__ == "__main__":
    mcp.run()
