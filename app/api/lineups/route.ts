import { NextRequest, NextResponse } from "next/server";
import { nanoid } from "nanoid";
import { db } from "@/lib/db";
import { lineups } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function GET(req: NextRequest) {
  const slug = req.nextUrl.searchParams.get("slug");
  if (!slug) {
    return NextResponse.json({ error: "slug required for GET" }, { status: 400 });
  }
  try {
    const row = await db.query.lineups.findFirst({
      where: eq(lineups.shareSlug, slug),
    });
    if (!row) {
      return NextResponse.json({ error: "Lineup not found" }, { status: 404 });
    }
    return NextResponse.json(row);
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Failed to fetch lineup" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      teamId,
      name,
      battingOrder = [],
      positions = {},
      bench = [],
      bullpen = [],
      constraintTags = [],
    } = body;
    if (!teamId || !Array.isArray(battingOrder)) {
      return NextResponse.json(
        { error: "teamId and battingOrder required" },
        { status: 400 }
      );
    }
    const id = nanoid();
    const shareSlug = nanoid(10);
    await db.insert(lineups).values({
      id,
      shareSlug,
      teamId,
      name: name ?? null,
      battingOrder,
      positions: positions as Record<string, string>,
      bench,
      bullpen,
      constraintTags,
    });
    return NextResponse.json({ id, shareSlug });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Failed to create lineup" },
      { status: 500 }
    );
  }
}
