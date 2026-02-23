import { NextRequest, NextResponse } from "next/server";
import { fetchRoster, fetchPlayerWithStats } from "@/lib/mlb-api";
import { db } from "@/lib/db";
import { players } from "@/lib/db/schema";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ teamId: string }> }
) {
  const { teamId } = await params;
  const teamIdNum = parseInt(teamId, 10);
  if (Number.isNaN(teamIdNum)) {
    return NextResponse.json({ error: "Invalid team ID" }, { status: 400 });
  }
  try {
    const rosterData = await fetchRoster(teamIdNum, "active");
    const roster = rosterData.roster ?? [];
    const result: Array<{
      id: string;
      mlbId: number;
      name: string;
      positions: string;
      batSide: string | null;
      throwSide: string | null;
      headshotUrl: string | null;
      depthOrder: number;
      obp: string | null;
      slg: string | null;
      bbPct: string | null;
      kPct: string | null;
      sb: number | null;
      cs: number | null;
      defRuns: string | null;
      pa: number | null;
      season: number | null;
      teamId: string;
    }> = [];
    for (let i = 0; i < roster.length; i++) {
      const entry = roster[i];
      const personId = entry.person.id;
      const playerData = await fetchPlayerWithStats(personId, teamId, i, 2024);
      result.push({
        id: playerData.id,
        mlbId: playerData.mlbId,
        name: playerData.name,
        positions: playerData.positions,
        batSide: playerData.batSide,
        throwSide: playerData.throwSide,
        headshotUrl: playerData.headshotUrl,
        depthOrder: playerData.depthOrder,
        obp: playerData.obp,
        slg: playerData.slg,
        bbPct: playerData.bbPct,
        kPct: playerData.kPct,
        sb: playerData.sb,
        cs: playerData.cs,
        defRuns: playerData.defRuns,
        pa: playerData.pa,
        season: playerData.season,
        teamId: playerData.teamId,
      });
      await db
        .insert(players)
        .values({
          id: playerData.id,
          mlbId: playerData.mlbId,
          teamId: playerData.teamId,
          name: playerData.name,
          positions: playerData.positions,
          batSide: playerData.batSide,
          throwSide: playerData.throwSide,
          headshotUrl: playerData.headshotUrl,
          depthOrder: playerData.depthOrder,
          obp: playerData.obp,
          slg: playerData.slg,
          bbPct: playerData.bbPct,
          kPct: playerData.kPct,
          sb: playerData.sb,
          cs: playerData.cs,
          defRuns: playerData.defRuns,
          pa: playerData.pa,
          season: playerData.season,
        })
        .onConflictDoUpdate({
          target: players.id,
          set: {
            name: playerData.name,
            positions: playerData.positions,
            obp: playerData.obp,
            slg: playerData.slg,
            bbPct: playerData.bbPct,
            kPct: playerData.kPct,
            sb: playerData.sb,
            cs: playerData.cs,
            pa: playerData.pa,
            updatedAt: new Date(),
          },
        });
    }
    return NextResponse.json(result);
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Failed to fetch roster" },
      { status: 500 }
    );
  }
}
