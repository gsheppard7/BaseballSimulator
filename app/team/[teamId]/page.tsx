import Link from "next/link";
import { notFound } from "next/navigation";
import { BatBadge, PlayerAvatar } from "@/components/PlayerAvatar";
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

export default async function TeamPage({
  params,
}: {
  params: Promise<{ teamId: string }>;
}) {
  const { teamId } = await params;
  const [roster, team] = await Promise.all([getRoster(teamId), fetchTeamMeta(teamId)]);
  if (roster === null) notFound();

  const color = teamColor(team?.abbrev);
  const fg = onColor(color);

  return (
    <div className="space-y-8">
      <section className="overflow-hidden rounded-3xl shadow-card" style={{ backgroundColor: color, color: fg }}>
        <div className="flex flex-wrap items-end justify-between gap-4 px-6 py-7 sm:px-8">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] opacity-75">
              {team?.division ? shortDivision(team.division) : "Active roster"}
            </p>
            <h1 className="mt-1 font-display text-4xl tracking-wide sm:text-5xl">
              {team?.name ?? "Roster"}
            </h1>
            <p className="mt-2 text-sm opacity-80">
              {roster.length} players. Set the order, then simulate the season.
            </p>
          </div>
          <Link
            href={`/lineup/new?team=${teamId}`}
            className="btn border border-white/30 bg-white/15 hover:bg-white/25"
            style={{ color: fg }}
          >
            Build lineup
          </Link>
        </div>
      </section>

      <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {roster.map(
          (player: {
            id: string;
            name: string;
            positions: string;
            batSide: string | null;
            headshotUrl: string | null;
            obp: string | null;
            slg: string | null;
          }) => (
            <li key={player.id} className="surface flex items-center gap-3 p-3">
              <PlayerAvatar name={player.name} url={player.headshotUrl} size="lg" />
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <p className="truncate font-semibold text-ink-950 dark:text-chalk">{player.name}</p>
                  <BatBadge side={player.batSide} />
                </div>
                <p className="text-sm text-ink-900/60 dark:text-chalk/60">{player.positions}</p>
                {(player.obp != null || player.slg != null) && (
                  <p className="mt-1 text-xs font-medium tabular-nums text-ink-900/70 dark:text-chalk/70">
                    OBP {player.obp ?? "—"}
                    <span className="mx-1.5 text-ink-900/30">/</span>
                    SLG {player.slg ?? "—"}
                  </p>
                )}
              </div>
            </li>
          )
        )}
      </ul>
    </div>
  );
}
