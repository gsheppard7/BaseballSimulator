"""
Season simulation: PA-level event model, 162 games x N seasons.
Tracks per-player stats over one sample season for projected stats and leaders.
"""
import random
from .models import (
    SimulateInput,
    SimulateResponse,
    RunsPerGameStats,
    WinsPer162Stats,
    BatterSlot,
    PlayerStats,
    ProjectedPlayerStats,
    Leaders,
    StatLeader,
)

GAMES_PER_SEASON = 162
INNINGS_PER_GAME = 9
OUTS_PER_INNING = 3


def event_probs_from_stats(slot) -> dict:
    """Convert OBP/SLG to event probabilities. ~70% of balls in play are outs (BABIP ~.300)."""
    stats = slot.stats
    obp = 0.32
    slg = 0.40
    if stats.obp is not None:
        try:
            obp = float(stats.obp)
        except (TypeError, ValueError):
            pass
    if stats.slg is not None:
        try:
            slg = float(stats.slg)
        except (TypeError, ValueError):
            pass
    bb_rate = max(0.02, min(0.15, (obp - 0.28) * 0.5 + 0.08))
    k_rate = max(0.10, min(0.35, 0.25 - (obp - 0.32) * 0.3))
    in_play = 1.0 - bb_rate - k_rate  # fraction of PAs that are balls in play
    # Balls-in-play hit rate: tuned so league-avg OBP/SLG yields ~4.3 R/G and ~81 wins
    babip = 0.36
    hits_in_play = in_play * babip
    out_in_play = in_play * (1.0 - babip)
    # Split hits by type so SLG is in the right range (power: more HR/2B)
    # Approx shares of hits: 1B ~68%, 2B ~22%, 3B ~2%, HR ~8%; tune HR by SLG
    hr_share = 0.05 + 0.15 * max(0, min(1, (slg - 0.35) / 0.25))  # more SLG -> more HR
    double_share = 0.20
    triple_share = 0.02
    single_share = 1.0 - hr_share - double_share - triple_share
    single = hits_in_play * single_share
    double = hits_in_play * double_share
    triple = hits_in_play * triple_share
    hr = hits_in_play * hr_share
    out = out_in_play + 0.0  # K already counted; this is in-play outs
    # Normalize so probs sum to 1
    total = bb_rate + k_rate + single + double + triple + hr + out
    if total <= 0:
        total = 1.0
    return {
        "BB": bb_rate / total,
        "K": k_rate / total,
        "1B": single / total,
        "2B": double / total,
        "3B": triple / total,
        "HR": hr / total,
        "out": out / total,
    }


def _sample_event(probs: dict) -> str:
    r = random.random()
    cum = 0.0
    for e, p in probs.items():
        cum += p
        if r <= cum:
            return e
    return "out"


def run_half_inning(batting_order: list, event_probs: list) -> int:
    runs = 0
    outs = 0
    bases = [False, False, False]
    batter_index = 0
    while outs < OUTS_PER_INNING:
        probs = event_probs[batter_index % len(event_probs)]
        event = _sample_event(probs)
        if event == "BB":
            if bases[0] and bases[1] and bases[2]:
                runs += 1
            elif bases[0] and bases[1]:
                bases[2] = True
                bases[0] = True
                bases[1] = True
            elif bases[0]:
                bases[1] = True
                bases[0] = True
            else:
                bases[0] = True
        elif event == "K" or event == "out":
            outs += 1
        elif event == "1B":
            if bases[2]:
                runs += 1
                bases[2] = False
            if bases[1]:
                runs += 1
                bases[1] = False
            if bases[0]:
                bases[2] = True
                bases[0] = False
            bases[0] = True
        elif event == "2B":
            for i in [2, 1, 0]:
                if bases[i]:
                    runs += 1
                    bases[i] = False
            bases[1] = True
        elif event == "3B":
            for i in [2, 1, 0]:
                if bases[i]:
                    runs += 1
                    bases[i] = False
            bases[2] = True
        elif event == "HR":
            runs += 1 + sum(bases)
            bases = [False, False, False]
        batter_index += 1
    return runs


def run_half_inning_with_events(
    event_probs: list, start_batter_index: int
) -> tuple[int, list[tuple[int, str]]]:
    """Returns (runs, list of (batter_slot_index, event)) for this half-inning."""
    runs = 0
    outs = 0
    bases = [False, False, False]
    batter_index = start_batter_index
    events: list[tuple[int, str]] = []
    while outs < OUTS_PER_INNING:
        slot_index = batter_index % 9
        probs = event_probs[slot_index]
        event = _sample_event(probs)
        events.append((slot_index, event))
        if event == "BB":
            if bases[0] and bases[1] and bases[2]:
                runs += 1
            elif bases[0] and bases[1]:
                bases[2] = True
                bases[0] = True
                bases[1] = True
            elif bases[0]:
                bases[1] = True
                bases[0] = True
            else:
                bases[0] = True
        elif event == "K" or event == "out":
            outs += 1
        elif event == "1B":
            if bases[2]:
                runs += 1
                bases[2] = False
            if bases[1]:
                runs += 1
                bases[1] = False
            if bases[0]:
                bases[2] = True
                bases[0] = False
            bases[0] = True
        elif event == "2B":
            for i in [2, 1, 0]:
                if bases[i]:
                    runs += 1
                    bases[i] = False
            bases[1] = True
        elif event == "3B":
            for i in [2, 1, 0]:
                if bases[i]:
                    runs += 1
                    bases[i] = False
            bases[2] = True
        elif event == "HR":
            runs += 1 + sum(bases)
            bases = [False, False, False]
        batter_index += 1
    return runs, events


def run_game(batting_order: list, event_probs: list, opp_rpg: float) -> tuple[int, int]:
    team_runs = 0
    for _ in range(INNINGS_PER_GAME):
        team_runs += run_half_inning(batting_order[:9], event_probs)
    opp_runs = round(random.gauss(opp_rpg, 1.2))
    opp_runs = max(0, opp_runs)
    return team_runs, opp_runs


def run_one_season_with_stats(
    batting_order: list,
    event_probs: list,
) -> tuple[list[dict], int]:
    """Run one 162-game season, return (per-slot stat dicts, total_team_runs)."""
    n_slots = 9
    # per slot: pa, ab, h, 1B, 2B, 3B, hr, bb, k
    stats = [{"pa": 0, "ab": 0, "h": 0, "1B": 0, "2B": 0, "3B": 0, "hr": 0, "bb": 0, "k": 0} for _ in range(n_slots)]
    batter_index = 0
    total_runs = 0
    for _ in range(GAMES_PER_SEASON * INNINGS_PER_GAME * 2):  # 162 * 9 * 2 half-innings
        runs, events = run_half_inning_with_events(event_probs, batter_index)
        total_runs += runs
        for slot_index, event in events:
            s = stats[slot_index]
            s["pa"] += 1
            if event == "BB":
                s["bb"] += 1
            elif event == "K":
                s["k"] += 1
                s["ab"] += 1
            elif event == "out":
                s["ab"] += 1
            else:
                s["ab"] += 1
                s["h"] += 1
                key = "hr" if event == "HR" else event
                s[key] = s.get(key, 0) + 1
        batter_index += len(events)
    return stats, total_runs


def run_simulation(input: SimulateInput) -> SimulateResponse:
    batting_order = list(input.batting_order)
    n_seasons = input.n_seasons
    league_avg_rpg = input.league_avg_runs_per_game
    if len(batting_order) < 9:
        dummy = BatterSlot(player_id="", position="DH", stats=PlayerStats(id=""))
        batting_order = batting_order + [dummy] * (9 - len(batting_order))
    event_probs = [event_probs_from_stats(s) for s in batting_order[:9]]

    runs_per_game_list: list[float] = []
    wins_per_season_list: list[int] = []

    for _ in range(n_seasons):
        season_runs = 0
        wins = 0
        for _ in range(GAMES_PER_SEASON):
            tr, opp = run_game(batting_order, event_probs, league_avg_rpg)
            season_runs += tr
            if tr > opp:
                wins += 1
        runs_per_game_list.append(season_runs / GAMES_PER_SEASON)
        wins_per_season_list.append(wins)

    runs_sorted = sorted(runs_per_game_list)
    n = len(runs_sorted)
    runs_mean = sum(runs_per_game_list) / n
    runs_median = runs_sorted[n // 2] if n else 0
    runs_p10 = runs_sorted[int(0.10 * n)] if n else 0
    runs_p90 = runs_sorted[int(0.90 * n)] if n else 0

    wins_mean = sum(wins_per_season_list) / n
    wins_var = sum((w - wins_mean) ** 2 for w in wins_per_season_list) / n
    wins_std = wins_var ** 0.5
    min_w, max_w = min(wins_per_season_list), max(wins_per_season_list)
    num_bins = min(20, max_w - min_w + 1)
    bin_width = (max_w - min_w + 1) / num_bins if max_w > min_w else 1
    histogram = [0] * num_bins
    for w in wins_per_season_list:
        idx = int((w - min_w) / bin_width) if bin_width > 0 else 0
        idx = min(idx, num_bins - 1)
        histogram[idx] += 1

    playoff_odds = sum(1 for w in wins_per_season_list if w >= 90) / n if n else 0.0

    # Run one sample season to get projected player stats and leaders
    raw_stats, _ = run_one_season_with_stats(batting_order[:9], event_probs)
    projected_stats_list: list[ProjectedPlayerStats] = []
    for i, slot in enumerate(batting_order[:9]):
        s = raw_stats[i]
        pa = s["pa"]
        ab = s["ab"]
        h = s["h"]
        bb = s["bb"]
        single = s.get("1B", 0)
        double = s.get("2B", 0)
        triple = s.get("3B", 0)
        hr = s.get("HR", s.get("hr", 0))
        k = s["k"]
        avg = round(h / ab, 3) if ab else 0.0
        obp = round((h + bb) / pa, 3) if pa else 0.0
        tb = single + 2 * double + 3 * triple + 4 * hr
        slg = round(tb / ab, 3) if ab else 0.0
        projected_stats_list.append(
            ProjectedPlayerStats(
                player_id=slot.player_id,
                position=slot.position,
                pa=pa,
                ab=ab,
                h=h,
                single=single,
                double=double,
                triple=triple,
                hr=hr,
                bb=bb,
                k=k,
                avg=avg,
                obp=obp,
                slg=slg,
            )
        )

    # Leaders (top 3 per category)
    by_avg = sorted(projected_stats_list, key=lambda x: x.avg, reverse=True)[:3]
    by_obp = sorted(projected_stats_list, key=lambda x: x.obp, reverse=True)[:3]
    by_slg = sorted(projected_stats_list, key=lambda x: x.slg, reverse=True)[:3]
    by_hr = sorted(projected_stats_list, key=lambda x: x.hr, reverse=True)[:3]
    leaders = Leaders(
        avg=[StatLeader(player_id=p.player_id, position=p.position, value=p.avg, stat="avg") for p in by_avg],
        obp=[StatLeader(player_id=p.player_id, position=p.position, value=p.obp, stat="obp") for p in by_obp],
        slg=[StatLeader(player_id=p.player_id, position=p.position, value=p.slg, stat="slg") for p in by_slg],
        hr=[StatLeader(player_id=p.player_id, position=p.position, value=float(p.hr), stat="hr") for p in by_hr],
    )

    return SimulateResponse(
        runs_per_game=RunsPerGameStats(
            mean=round(runs_mean, 3),
            median=round(runs_median, 3),
            p10=round(runs_p10, 3),
            p90=round(runs_p90, 3),
        ),
        wins_per_162=WinsPer162Stats(
            mean=round(wins_mean, 1),
            std=round(wins_std, 1),
            histogram=histogram,
        ),
        playoff_odds=round(playoff_odds, 3),
        projected_stats=projected_stats_list,
        leaders=leaders,
    )
