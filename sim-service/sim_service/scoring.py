"""
Level 1 lineup scoring: Offense (Runs Created style) + Defense + Baserunning.
"""
from .models import LineupInput, ScoreResponse, BatterSlot, PlayerStats

PA_PER_GAME = 38.0
GAMES_PER_SEASON = 162

# Position difficulty weights (runs per 162 relative to average)
POSITION_WEIGHT = {
    "P": 0,
    "C": 12.5,
    "1B": -12.5,
    "2B": 2.5,
    "3B": 2.5,
    "SS": 7.5,
    "LF": -7.5,
    "CF": 2.5,
    "RF": -7.5,
}


def rc_per_pa(obp: float, slg: float) -> float:
    """Simple runs created per PA. Use league-avg if missing."""
    if obp is None or slg is None:
        return 0.10  # ~league average placeholder
    try:
        o = max(0.01, min(0.99, float(obp)))
        s = max(0.01, min(2.0, float(slg)))
    except (TypeError, ValueError):
        return 0.10
    # (OBP * SLG) / (1 - OBP) scaled to per-PA
    denom = 1.0 - o
    if denom <= 0:
        return 0.10
    return (o * s) / denom / 40.0  # rough scale to runs/PA


def offense_total(batting_order: list) -> float:
    total = 0.0
    for slot in batting_order:
        stats = slot.stats
        obp = stats.obp
        slg = stats.slg
        if obp is not None and isinstance(obp, str):
            try:
                obp = float(obp)
            except ValueError:
                obp = None
        if slg is not None and isinstance(slg, str):
            try:
                slg = float(slg)
            except ValueError:
                slg = None
        total += rc_per_pa(obp, slg)
    # Scale to runs per game (9 batters * PA per game / 9)
    runs_per_game_off = total / 9.0 * PA_PER_GAME
    return runs_per_game_off


def defense_total(batting_order: list) -> float:
    total = 0.0
    for slot in batting_order:
        pos = slot.position if hasattr(slot, "position") else "DH"
        weight = POSITION_WEIGHT.get(pos, 0.0)
        dr = 0.0
        if slot.stats.def_runs is not None:
            try:
                dr = float(slot.stats.def_runs)
            except (TypeError, ValueError):
                pass
        total += weight + dr
    return total / GAMES_PER_SEASON  # convert to runs per game


def baserunning_total(batting_order: list) -> float:
    # SB ~0.2 runs, CS ~-0.4 runs (approx)
    total = 0.0
    for slot in batting_order:
        sb = slot.stats.sb or 0
        cs = slot.stats.cs or 0
        pa = slot.stats.pa or 600
        if pa <= 0:
            continue
        rate = (sb - 2 * cs) / pa * 600.0  # per 600 PA
        total += rate * 0.2 / 600.0 * (PA_PER_GAME / 9.0)
    return total


def score_lineup(input: LineupInput) -> ScoreResponse:
    batting_order = list(input.batting_order)
    if len(batting_order) < 9:
        dummy = BatterSlot(
            player_id="",
            position="DH",
            stats=PlayerStats(id="", obp=0.3, slg=0.4),
        )
        batting_order = batting_order + [dummy] * (9 - len(batting_order))

    offense = offense_total(batting_order)
    defense = defense_total(batting_order)
    baserunning = baserunning_total(batting_order)
    runs_per_game = offense + defense + baserunning
    lineup_score = 100.0 + (runs_per_game - 4.33) * 25.0  # scale around league avg 4.33
    return ScoreResponse(
        lineup_score=round(lineup_score, 2),
        runs_per_game=round(runs_per_game, 3),
        offense=round(offense, 3),
        defense=round(defense, 3),
        baserunning=round(baserunning, 3),
    )
