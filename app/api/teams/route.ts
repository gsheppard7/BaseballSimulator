import { NextResponse } from "next/server";
import { fetchTeams } from "@/lib/mlb-api";
import { db } from "@/lib/db";
import { teams } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function GET() {
  try {
    const season = 2024;
    const data = await fetchTeams(season);
    const mlbTeams = data.teams ?? [];
    const list = mlbTeams.map((t) => ({
      id: String(t.id),
      mlbId: t.id,
      abbrev: t.abbreviation,
      name: t.name,
      teamName: t.teamName ?? t.name,
      division: t.division?.name ?? null,
    }));
    for (const t of list) {
      await db
        .insert(teams)
        .values({
          id: t.id,
          mlbId: t.mlbId,
          abbrev: t.abbrev,
          name: t.name,
          division: t.division ?? undefined,
        })
        .onConflictDoUpdate({
          target: teams.id,
          set: { name: t.name, division: t.division ?? null, updatedAt: new Date() },
        });
    }
    return NextResponse.json(list);
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Failed to fetch teams" },
      { status: 500 }
    );
  }
}
