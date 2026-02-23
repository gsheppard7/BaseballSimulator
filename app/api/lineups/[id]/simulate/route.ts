import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { lineups, players, lineupScores } from "@/lib/db/schema";
import { eq, inArray } from "drizzle-orm";
import { buildBattingOrderPayload, fetchSimulate } from "@/lib/sim-payload";
import { nanoid } from "nanoid";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  const nSeasons = Math.min(10000, Math.max(100, Number(body.n_seasons) || 1000));
  try {
    const lineup = await db.query.lineups.findFirst({
      where: eq(lineups.id, id),
    });
    if (!lineup) {
      return NextResponse.json({ error: "Lineup not found" }, { status: 404 });
    }
    const playerIds = [
      ...(Array.isArray(lineup.battingOrder) ? lineup.battingOrder : []),
      ...Object.values(lineup.positions ?? {}),
    ].filter(Boolean) as string[];
    const playerRows =
      playerIds.length > 0
        ? await db.select().from(players).where(inArray(players.id, playerIds))
        : [];
    const playerMap = new Map(
      playerRows.map((p) => [
        p.id,
        {
          id: p.id,
          name: p.name,
          obp: p.obp,
          slg: p.slg,
          bbPct: p.bbPct,
          kPct: p.kPct,
          sb: p.sb,
          cs: p.cs,
          defRuns: p.defRuns,
          pa: p.pa,
        },
      ])
    );
    const nameById = new Map(playerRows.map((p) => [p.id, p.name]));
    const payload = buildBattingOrderPayload(
      {
        battingOrder: (lineup.battingOrder as string[]) ?? [],
        positions: (lineup.positions as Record<string, string>) ?? {},
      },
      playerMap
    );
    const result = await fetchSimulate(payload, nSeasons);
    // Enrich projected_stats and leaders with player names
    const enriched = { ...result };
    if (result.projected_stats) {
      enriched.projected_stats = result.projected_stats.map((p: { player_id: string; [k: string]: unknown }) => ({
        ...p,
        name: nameById.get(p.player_id) ?? p.player_id,
      }));
    }
    if (result.leaders) {
      const addName = (arr: { player_id: string; [k: string]: unknown }[], stat: string) =>
        arr.map((l) => ({ ...l, name: nameById.get(l.player_id) ?? l.player_id, stat }));
      enriched.leaders = {
        avg: addName(result.leaders.avg, "avg"),
        obp: addName(result.leaders.obp, "obp"),
        slg: addName(result.leaders.slg, "slg"),
        hr: addName(result.leaders.hr, "hr"),
      };
    }
    await db.insert(lineupScores).values({
      id: nanoid(),
      lineupId: id,
      runsPerGame: String(result.runs_per_game?.mean),
      winsPer162: String(result.wins_per_162?.mean),
      playoffOdds: String(result.playoff_odds),
      lineupScore: String(
        (result.wins_per_162?.mean ?? 0) * 2 + (result.runs_per_game?.mean ?? 0) * 5
      ),
      metricVersion: "v1",
      simRunCount: nSeasons,
    });
    return NextResponse.json(enriched);
  } catch (e) {
    console.error(e);
    const message =
      e instanceof Error && (e.message.includes("404") || e.message.includes("fetch"))
        ? "Sim service not running. In a terminal run: cd sim-service && pip install -r requirements.txt && PYTHONPATH=. uvicorn sim_service.main:app --port 8008"
        : "Failed to run simulation";
    return NextResponse.json({ error: message }, { status: 503 });
  }
}
