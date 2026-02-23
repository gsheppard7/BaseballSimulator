import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { leaderboardEntries, teams, lineups } from "@/lib/db/schema";
import { desc, inArray } from "drizzle-orm";

export async function GET(req: NextRequest) {
  const teamId = req.nextUrl.searchParams.get("team");
  const constraint = req.nextUrl.searchParams.get("constraint");
  const limit = Math.min(100, Math.max(1, Number(req.nextUrl.searchParams.get("limit")) || 20));
  try {
    let query = db
      .select({
        id: leaderboardEntries.id,
        lineupId: leaderboardEntries.lineupId,
        teamId: leaderboardEntries.teamId,
        score: leaderboardEntries.score,
        constraintTags: leaderboardEntries.constraintTags,
        displayName: leaderboardEntries.displayName,
        createdAt: leaderboardEntries.createdAt,
      })
      .from(leaderboardEntries)
      .orderBy(desc(leaderboardEntries.score))
      .limit(limit);

    const rows = await query;
    let filtered = rows;
    if (teamId) {
      filtered = rows.filter((r) => r.teamId === teamId);
    }
    if (constraint) {
      filtered = filtered.filter((r) => {
        const tags = r.constraintTags as string[] | null;
        return Array.isArray(tags) && tags.includes(constraint);
      });
    }

    const teamIds = Array.from(new Set(filtered.map((r) => r.teamId)));
    const lineupIds = Array.from(new Set(filtered.map((r) => r.lineupId)));
    const teamRows =
      teamIds.length > 0
        ? await db.select().from(teams).where(inArray(teams.id, teamIds))
        : [];
    const lineupRows =
      lineupIds.length > 0
        ? await db.select({ id: lineups.id, shareSlug: lineups.shareSlug }).from(lineups).where(inArray(lineups.id, lineupIds))
        : [];
    const teamMap = new Map(teamRows.map((t) => [t.id, t]));
    const lineupMap = new Map(lineupRows.map((l) => [l.id, l.shareSlug]));

    const list = filtered.map((r) => ({
      id: r.id,
      lineupId: r.lineupId,
      shareSlug: lineupMap.get(r.lineupId) ?? null,
      teamId: r.teamId,
      teamName: teamMap.get(r.teamId)?.name ?? null,
      score: r.score,
      constraintTags: r.constraintTags,
      displayName: r.displayName,
      createdAt: r.createdAt,
    }));

    return NextResponse.json(list);
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Failed to fetch leaderboard" },
      { status: 500 }
    );
  }
}
