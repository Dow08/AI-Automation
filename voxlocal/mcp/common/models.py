"""Registre des modèles et politique de routage VoxLocal.

Centralise le mapping tâche -> modèle pour l'ÉCONOMIE DE TOKENS.
Tiers : 1 = économique (Flash/Haiku) < 2 = standard (Sonnet) < 3 = critique (Opus).
"""
from dataclasses import dataclass, asdict


@dataclass(frozen=True)
class Model:
    id: str
    provider: str
    tier: int  # 1 économique, 2 standard, 3 premium
    notes: str


# NB: l'identifiant exact du modèle Gemini Flash est à confirmer côté API Google.
MODELS = {
    "gemini-flash": Model("gemini-flash", "google", 1, "Rapide, peu cher, bon FR, voix temps réel"),
    "claude-haiku": Model("claude-haiku-4-5-20251001", "anthropic", 1, "Rapide, peu cher, alternative voix"),
    "claude-sonnet": Model("claude-sonnet-4-6", "anthropic", 2, "Build standard, intégrations, code"),
    "claude-opus": Model("claude-opus-4-8", "anthropic", 3, "Archi, sécurité, conformité, QA critique"),
}

# Type de tâche -> modèle par défaut
TASK_MODEL_MAP = {
    "scrape": "gemini-flash",
    "bulk": "gemini-flash",
    "draft": "gemini-flash",
    "content": "gemini-flash",
    "classify": "gemini-flash",
    "voice_realtime": "gemini-flash",
    "build": "claude-sonnet",
    "integration": "claude-sonnet",
    "code": "claude-sonnet",
    "architecture": "claude-opus",
    "security": "claude-opus",
    "compliance": "claude-opus",
    "guardrail": "claude-opus",
    "qa_critical": "claude-opus",
}

DEFAULT_MODEL = "claude-sonnet"


def route(task_type: str, criticality: str = "normal") -> dict:
    """Retourne le modèle conseillé pour une tâche, avec justification.

    criticality: "low" (force l'économie), "normal", "critical" (force Opus).
    """
    key = TASK_MODEL_MAP.get(task_type.lower(), DEFAULT_MODEL)
    model = MODELS[key]

    if criticality == "critical" and model.tier < 3:
        key, model = "claude-opus", MODELS["claude-opus"]
        reason = f"Criticité élevée pour '{task_type}' -> Opus."
    elif criticality == "low" and model.tier > 1:
        key, model = "gemini-flash", MODELS["gemini-flash"]
        reason = f"Basse criticité pour '{task_type}' -> Flash (économie de tokens)."
    else:
        reason = f"'{task_type}' -> {key} (politique par défaut)."

    return {
        "task_type": task_type,
        "criticality": criticality,
        "model_key": key,
        "model_id": model.id,
        "provider": model.provider,
        "tier": model.tier,
        "rationale": reason,
    }


def policy() -> dict:
    """Expose la politique complète (modèles + mapping)."""
    return {
        "models": {k: asdict(v) for k, v in MODELS.items()},
        "task_map": TASK_MODEL_MAP,
        "default": DEFAULT_MODEL,
    }
