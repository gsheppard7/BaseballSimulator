/**
 * Build payload for sim service from lineup + player records.
 */
export interface PlayerRecord {
  id: string;
  obp: string | null;
  slg: string | null;
  bbPct: string | null;
  kPct: string | null;
  sb: number | null;
  cs: number | null;
  defRuns: string | null;
  pa: number | null;
}

export interface LineupRecord {
  battingOrder: string[];
  positions: Record<string, string>;
}

export interface BatterSlotPayload {
  player_id: string;
  position: string;
  stats: {
    id: string;
    obp: number | null;
    slg: number | null;
    bb_pct: number | null;
    k_pct: number | null;
    sb: number;
    cs: number;
    def_runs: number | null;
    pa: number | null;
  };
}

function num(v: string | null | undefined): number | null {
  if (v == null || v === "") return null;
  const n = parseFloat(v);
  return Number.isNaN(n) ? null : n;
}

export function buildBattingOrderPayload(
  lineup: LineupRecord,
  playerMap: Map<string, PlayerRecord>
): BatterSlotPayload[] {
  const positions = lineup.positions ?? {};
  const order = lineup.battingOrder ?? [];
  const playerIdToPosition: Record<string, string> = {};
  for (const [pos, pid] of Object.entries(positions)) {
    if (pid) playerIdToPosition[pid] = pos;
  }
  const slots: BatterSlotPayload[] = [];
  for (let i = 0; i < 9; i++) {
    const playerId = order[i] ?? "";
    const player = playerId ? playerMap.get(playerId) : null;
    const position = playerIdToPosition[playerId] ?? "DH";
    slots.push({
      player_id: playerId,
      position,
      stats: {
        id: playerId,
        obp: player ? num(player.obp) : null,
        slg: player ? num(player.slg) : null,
        bb_pct: player ? num(player.bbPct) : null,
        k_pct: player ? num(player.kPct) : null,
        sb: player?.sb ?? 0,
        cs: player?.cs ?? 0,
        def_runs: player ? num(player.defRuns) : null,
        pa: player?.pa ?? null,
      },
    });
  }
  return slots;
}

const SIM_SERVICE_URL = process.env.SIM_SERVICE_URL ?? "http://localhost:8008";

export async function fetchScore(battingOrder: BatterSlotPayload[]) {
  const res = await fetch(`${SIM_SERVICE_URL}/score`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      batting_order: battingOrder,
      metric_version: "v1",
    }),
  });
  if (!res.ok) {
    const t = await res.text();
    throw new Error(`Sim service score: ${res.status} ${t}`);
  }
  return res.json();
}

export async function fetchSimulate(
  battingOrder: BatterSlotPayload[],
  nSeasons = 1000
) {
  const res = await fetch(`${SIM_SERVICE_URL}/simulate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      batting_order: battingOrder,
      n_seasons: nSeasons,
      league_avg_runs_per_game: 4.33,
    }),
  });
  if (!res.ok) {
    const t = await res.text();
    throw new Error(`Sim service simulate: ${res.status} ${t}`);
  }
  return res.json();
}
