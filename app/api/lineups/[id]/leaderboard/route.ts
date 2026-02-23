import { NextRequest, NextResponse } from "next/server";
import { nanoid } from "nanoid";
import { db } from "@/lib/db";
import { lineups, lineupScores, leaderboardEntries } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: lineupId } = await params;
  try {
    const body = await req.json().catch(() => ({}));
    const displayName = String(body.displayName ?? "Anonymous").slice(0, 64);
    const constraintTags = Array.isArray(body.constraintTags)
      ? body.constraintTags.slice(0, 10)
      : [];

    const lineup = await db.query.lineups.findFirst({
      where: eq(lineups.id, lineupId),
    });
    if (!lineup) {
      return NextResponse.json({ error: "Lineup not found" }, { status: 404 });
    }

    const [latestScore] = await db
      .select()
      .from(lineupScores)
      .where(eq(lineupScores.lineupId, lineupId))
      .orderBy(desc(lineupScores.createdAt))
      .limit(1);
    const score = latestScore?.lineupScore ?? "0";

    await db.insert(leaderboardEntries).values({
      id: nanoid(),
      lineupId,
      teamId: lineup.teamId,
      score,
      constraintTags,
      displayName,
    });

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Failed to submit to leaderboard" },
      { status: 500 }
    );
  }
}
