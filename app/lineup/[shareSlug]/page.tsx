import { notFound } from "next/navigation";
import Link from "next/link";
import { LineupBuilder } from "@/components/LineupBuilder";

export const dynamic = "force-dynamic";

async function getLineupBySlug(slug: string) {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const res = await fetch(`${base}/api/lineups?slug=${slug}`, {
    cache: "no-store",
  });
  if (!res.ok) return null;
  return res.json();
}

async function getRoster(teamId: string) {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const res = await fetch(`${base}/api/teams/${teamId}/roster`, {
    cache: "no-store",
  });
  if (!res.ok) return null;
  return res.json();
}

export default async function SharedLineupPage({
  params,
}: {
  params: Promise<{ shareSlug: string }>;
}) {
  const { shareSlug } = await params;
  const lineup = await getLineupBySlug(shareSlug);
  if (!lineup) notFound();
  const roster = await getRoster(lineup.teamId);
  if (!roster) notFound();

  const playerItems = roster.map(
    (p: {
      id: string;
      name: string;
      positions: string;
      batSide: string | null;
      headshotUrl: string | null;
      obp: string | null;
      slg: string | null;
    }) => ({
      id: p.id,
      name: p.name,
      positions: p.positions,
      batSide: p.batSide,
      headshotUrl: p.headshotUrl,
      obp: p.obp,
      slg: p.slg,
    })
  );

  const battingOrder = Array.isArray(lineup.battingOrder)
    ? lineup.battingOrder
    : [];
  const positions =
    lineup.positions && typeof lineup.positions === "object"
      ? lineup.positions
      : {};

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-stone-900 dark:text-stone-100">
          {lineup.name ?? "Shared lineup"}
        </h1>
        <Link
          href={`/lineup/new?team=${lineup.teamId}`}
          className="rounded-lg border border-stone-300 px-3 py-2 text-sm font-medium transition hover:bg-stone-100 dark:border-stone-600 dark:hover:bg-stone-800"
        >
          Clone to edit
        </Link>
      </div>
      <LineupBuilder
        roster={playerItems}
        teamId={lineup.teamId}
        initialBattingOrder={battingOrder}
        initialPositions={positions}
        lineupId={lineup.id}
        shareSlug={lineup.shareSlug}
      />
    </div>
  );
}
