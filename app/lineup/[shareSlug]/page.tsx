import { notFound } from "next/navigation";
import Link from "next/link";
import { LineupBuilder } from "@/components/LineupBuilder";
import { appBase, fetchTeamMeta } from "@/lib/fetch-teams";
import { onColor, teamColor } from "@/lib/team-colors";

export const dynamic = "force-dynamic";

async function getLineupBySlug(slug: string) {
  const res = await fetch(`${appBase()}/api/lineups?slug=${slug}`, {
    cache: "no-store",
  });
  if (!res.ok) return null;
  return res.json();
}

async function getRoster(teamId: string) {
  const res = await fetch(`${appBase()}/api/teams/${teamId}/roster`, {
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
  const [roster, team] = await Promise.all([
    getRoster(lineup.teamId),
    fetchTeamMeta(lineup.teamId),
  ]);
  if (!roster) notFound();
  const color = teamColor(team?.abbrev);
  const fg = onColor(color);

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
      <header
        className="flex flex-wrap items-end justify-between gap-4 overflow-hidden rounded-3xl px-6 py-6 shadow-card sm:px-8"
        style={{ backgroundColor: color, color: fg }}
      >
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] opacity-75">
            {team?.name ?? "Shared card"}
          </p>
          <h1 className="mt-1 font-display text-4xl tracking-wide sm:text-5xl">
            {lineup.name ?? "Shared lineup"}
          </h1>
        </div>
        <Link
          href={`/lineup/new?team=${lineup.teamId}`}
          className="btn border border-current/30 bg-white/15 hover:bg-white/25"
          style={{ color: fg }}
        >
          Clone to edit
        </Link>
      </header>
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
