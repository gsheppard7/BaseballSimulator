import { redirect } from "next/navigation";
import { LineupBuilder } from "@/components/LineupBuilder";
import { appBase, fetchTeamMeta } from "@/lib/fetch-teams";
import { onColor, shortDivision, teamColor } from "@/lib/team-colors";

export const dynamic = "force-dynamic";

async function getRoster(teamId: string) {
  const res = await fetch(`${appBase()}/api/teams/${teamId}/roster`, {
    cache: "no-store",
  });
  if (!res.ok) return null;
  return res.json();
}

export default async function NewLineupPage({
  searchParams,
}: {
  searchParams: Promise<{ team?: string }>;
}) {
  const { team: teamId } = await searchParams;
  if (!teamId) redirect("/team/select");
  const [roster, team] = await Promise.all([getRoster(teamId), fetchTeamMeta(teamId)]);
  if (!roster || roster.length === 0) redirect(`/team/${teamId}`);
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

  return (
    <div className="space-y-6">
      <header
        className="overflow-hidden rounded-3xl px-6 py-6 shadow-card sm:px-8"
        style={{ backgroundColor: color, color: fg }}
      >
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] opacity-75">
          {team?.division ? shortDivision(team.division) : "New card"}
        </p>
        <h1 className="mt-1 font-display text-4xl tracking-wide sm:text-5xl">
          {team?.name ?? "Build your lineup"}
        </h1>
        <p className="mt-2 max-w-xl text-sm opacity-80">
          Click a spot in the order or on the diamond, then choose a player. Save to score and share it.
        </p>
      </header>
      <LineupBuilder roster={playerItems} teamId={teamId} />
    </div>
  );
}
