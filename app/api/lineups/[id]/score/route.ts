import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { lineups, players, lineupScores } from "@/lib/db/schema";
import { eq, inArray } from "drizzle-orm";
import { buildBattingOrderPayload, fetchScore } from "@/lib/sim-payload";
import { nanoid } from "nanoid";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const lineup = await db.query.lineups.findFirst({
      where: eq(lineups.id, id),
    });
    if (!lineup) {
      return NextResponse.json({ error: "Lineup not found" }, { status: 404 });
    }
    const cached = await db.query.lineupScores.findFirst({
      where: eq(lineupScores.lineupId, id),
    });
    if (cached?.lineupScore != null) {
      return NextResponse.json({
        lineupScore: parseFloat(cached.lineupScore),
        runsPerGame: cached.runsPerGame ? parseFloat(cached.runsPerGame) : null,
        offense: null,
        defense: null,
        baserunning: null,
        cached: true,
      });
    }
    const playerIds = [
      ...(Array.isArray(lineup.battingOrder) ? lineup.battingOrder : []),
      ...Object.values(lineup.positions ?? {}),
    ].filter(Boolean) as string[];
    if (playerIds.length === 0) {
      return NextResponse.json({
        lineupScore: 100,
        runsPerGame: 4.33,
        offense: 4.33,
        defense: 0,
        baserunning: 0,
        cached: false,
      });
    }
    const playerRows = await db
      .select()
      .from(players)
      .where(inArray(players.id, playerIds));
    const playerMap = new Map(
      playerRows.map((p) => [
        p.id,
        {
          id: p.id,
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
    const payload = buildBattingOrderPayload(
      {
        battingOrder: (lineup.battingOrder as string[]) ?? [],
        positions: (lineup.positions as Record<string, string>) ?? {},
      },
      playerMap
    );
    let result: { lineup_score: number; runs_per_game: number };
    try {
      result = await fetchScore(payload);
    } catch (simErr) {
      console.error("Sim service unavailable:", simErr);
      return NextResponse.json(
        {
          error:
            "Sim service not running. In a terminal run: cd sim-service && pip install -r requirements.txt && PYTHONPATH=. uvicorn sim_service.main:app --port 8008",
          lineupScore: 100,
          runsPerGame: 4.33,
        },
        { status: 503 }
      );
    }
    await db.insert(lineupScores).values({
      id: nanoid(),
      lineupId: id,
      runsPerGame: String(result.runs_per_game),
      lineupScore: String(result.lineup_score),
      metricVersion: "v1",
    });
    return NextResponse.json({
      ...result,
      cached: false,
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Failed to get score" },
      { status: 500 }
    );
  }
}
