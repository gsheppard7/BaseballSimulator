from pydantic import BaseModel
from typing import Optional


class PlayerStats(BaseModel):
    id: str
    obp: Optional[float] = None
    slg: Optional[float] = None
    bb_pct: Optional[float] = None
    k_pct: Optional[float] = None
    sb: int = 0
    cs: int = 0
    def_runs: Optional[float] = None
    pa: Optional[int] = None


class BatterSlot(BaseModel):
    player_id: str
    position: str  # field position for this slot
    stats: PlayerStats


class LineupInput(BaseModel):
    batting_order: list[BatterSlot]
    metric_version: str = "v1"


class ScoreResponse(BaseModel):
    lineup_score: float
    runs_per_game: float
    offense: float
    defense: float
    baserunning: float
    per_player: Optional[list[dict]] = None


class SimulateInput(BaseModel):
    batting_order: list[BatterSlot]
    n_seasons: int = 1000
    league_avg_runs_per_game: float = 4.33


class RunsPerGameStats(BaseModel):
    mean: float
    median: float
    p10: float
    p90: float


class WinsPer162Stats(BaseModel):
    mean: float
    std: float
    histogram: list[int]  # counts per bin


class ProjectedPlayerStats(BaseModel):
    player_id: str
    position: str
    pa: int
    ab: int
    h: int
    single: int
    double: int
    triple: int
    hr: int
    bb: int
    k: int
    avg: float
    obp: float
    slg: float


class StatLeader(BaseModel):
    player_id: str
    position: str
    value: float
    stat: str  # "avg", "obp", "slg", "hr", "rbi"


class Leaders(BaseModel):
    avg: list[StatLeader]  # top 3
    obp: list[StatLeader]
    slg: list[StatLeader]
    hr: list[StatLeader]


class SimulateResponse(BaseModel):
    runs_per_game: RunsPerGameStats
    wins_per_162: WinsPer162Stats
    playoff_odds: float
    projected_stats: Optional[list[ProjectedPlayerStats]] = None
    leaders: Optional[Leaders] = None
