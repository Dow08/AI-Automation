"""Grille de qualification ICP VoxLocal.

Score = volume (0-4) + indisponibilité (0-3) + ticket (0-3), sur 10.
Verdict : >=7 bon (mirror demo) · 5-6 nurture · <5 écarter.
Disqualifiants durs : <40 appels/mois, secrétaire dédiée non saturée.
Seuils par verticale = idéaux (en dessous -> rétrograde « bon » en « nurture »).
"""

VERTICAL_MIN = {
    "btp": {"volume_min": 60, "missed_min": 25},
    "sante": {"volume_min": 80, "missed_min": 20},
    "resto": {"volume_min": 100, "missed_min": 30},
}


def _score_volume(calls: int) -> int:
    if calls < 40:
        return 0
    if calls < 60:
        return 2
    if calls <= 100:
        return 3
    return 4


def _score_missed(rate: float) -> int:  # rate en %
    if rate < 15:
        return 0
    if rate <= 25:
        return 2
    return 3


def _score_ticket(value_eur: float, recurring: bool = False) -> int:
    if recurring:
        return 3
    if value_eur < 80:
        return 1
    if value_eur <= 200:
        return 2
    return 3


def score_prospect(
    vertical: str,
    monthly_calls: int,
    missed_rate: float,
    ticket_value: float,
    recurring: bool = False,
    has_idle_secretary: bool = False,
) -> dict:
    """Score un prospect et rend un verdict."""
    v = _score_volume(monthly_calls)
    m = _score_missed(missed_rate)
    t = _score_ticket(ticket_value, recurring)
    total = v + m + t

    # Disqualifiants durs
    disq = []
    if monthly_calls < 40:
        disq.append("volume < 40 appels/mois")
    if has_idle_secretary:
        disq.append("secrétaire dédiée non saturée")

    if disq:
        verdict = "ecarter"
    elif total >= 7:
        verdict = "bon"
    elif total >= 5:
        verdict = "nurture"
    else:
        verdict = "ecarter"

    # Seuils verticale (idéaux) : rétrograde « bon » en « nurture » si en dessous
    notes = []
    vmin = VERTICAL_MIN.get(vertical.lower())
    if vmin and verdict == "bon":
        if monthly_calls < vmin["volume_min"]:
            verdict = "nurture"
            notes.append(f"sous le seuil volume idéal {vertical} ({vmin['volume_min']})")
        if missed_rate < vmin["missed_min"]:
            verdict = "nurture"
            notes.append(f"sous le seuil manqués idéal {vertical} ({vmin['missed_min']}%)")

    return {
        "vertical": vertical,
        "score": total,
        "max": 10,
        "detail": {"volume": v, "indisponibilite": m, "ticket": t},
        "verdict": verdict,
        "disqualifiants": disq,
        "notes": notes,
    }


def grid() -> dict:
    """Expose la grille ICP complète."""
    return {
        "ponderation": {"volume": "0-4", "indisponibilite": "0-3", "ticket": "0-3", "total": "/10"},
        "verdicts": {">=7": "bon (mirror demo)", "5-6": "nurture", "<5": "ecarter"},
        "seuils_verticale": VERTICAL_MIN,
        "disqualifiants_durs": ["<40 appels/mois", "secrétaire dédiée non saturée"],
    }
