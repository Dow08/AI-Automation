"""MCP server: memory.

Expose les documents du projet (contexte/mémoires) pour que les agents lisent
le contexte AVANT d'agir (anti-dérive / anti-hallucination).
Recherche par mots-clés en V1 ; RAG vectoriel (Qdrant) = évolution ultérieure.
Lancer : py mcp/memory/server.py
"""
import glob
import os

from mcp.server.fastmcp import FastMCP

mcp = FastMCP("voxlocal-memory")

# Racine des connaissances : VOXLOCAL_MEMORY_PATH, sinon le dossier voxlocal/.
ROOT = os.path.abspath(
    os.environ.get("VOXLOCAL_MEMORY_PATH")
    or os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
)


def _md_files():
    return glob.glob(os.path.join(ROOT, "**", "*.md"), recursive=True)


@mcp.tool()
def list_memories() -> list:
    """Liste les documents de connaissance (chemins relatifs à la racine)."""
    return sorted(os.path.relpath(p, ROOT) for p in _md_files())


@mcp.tool()
def read_memory(path: str) -> str:
    """Lit un document par son chemin relatif (refuse toute sortie du périmètre)."""
    full = os.path.normpath(os.path.join(ROOT, path))
    if not full.startswith(ROOT):
        return "Erreur: chemin hors périmètre."
    if not os.path.isfile(full):
        return f"Erreur: introuvable: {path}"
    with open(full, encoding="utf-8") as f:
        return f.read()


@mcp.tool()
def search_memories(query: str, limit: int = 5) -> list:
    """Recherche par mots-clés dans les documents. Retourne les chemins les mieux notés."""
    terms = [t.lower() for t in query.split() if t]
    if not terms:
        return []
    scored = []
    for p in _md_files():
        try:
            with open(p, encoding="utf-8") as f:
                text = f.read().lower()
        except OSError:
            continue
        score = sum(text.count(t) for t in terms)
        if score:
            scored.append((score, os.path.relpath(p, ROOT)))
    scored.sort(reverse=True)
    return [{"path": p, "score": s} for s, p in scored[:limit]]


if __name__ == "__main__":
    mcp.run()
