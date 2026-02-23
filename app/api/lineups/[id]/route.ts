import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { lineups } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const slug = _req.nextUrl.searchParams.get("slug");
  try {
    const row = slug
      ? await db.query.lineups.findFirst({ where: eq(lineups.shareSlug, slug) })
      : await db.query.lineups.findFirst({ where: eq(lineups.id, id) });
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

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const body = await req.json();
    const { name, battingOrder, positions, bench, bullpen, constraintTags } = body;
    const update: Record<string, unknown> = { updatedAt: new Date() };
    if (name !== undefined) update.name = name;
    if (Array.isArray(battingOrder)) update.battingOrder = battingOrder;
    if (positions && typeof positions === "object") update.positions = positions;
    if (Array.isArray(bench)) update.bench = bench;
    if (Array.isArray(bullpen)) update.bullpen = bullpen;
    if (Array.isArray(constraintTags)) update.constraintTags = constraintTags;
    await db.update(lineups).set(update).where(eq(lineups.id, id));
    const row = await db.query.lineups.findFirst({ where: eq(lineups.id, id) });
    return NextResponse.json(row ?? {});
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Failed to update lineup" },
      { status: 500 }
    );
  }
}
