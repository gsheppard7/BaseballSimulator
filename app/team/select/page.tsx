import Link from "next/link";
import { fetchTeamList } from "@/lib/fetch-teams";
import { groupTeams, onColor, shortDivision, teamColor } from "@/lib/team-colors";

export const dynamic = "force-dynamic";

export default async function TeamSelectPage() {
  const teams = await fetchTeamList();
  const groups = groupTeams(teams);

  return (
    <div className="space-y-10">
      <header>
        <p className="page-kicker">30 clubs</p>
        <h1 className="page-title mt-2">Pick a team</h1>
        <p className="lede mt-3">
          Open a roster, then build the batting order and the defense.
        </p>
      </header>
      {groups.map((group) => (
        <section key={group.name}>
          <h2 className="section-title">{shortDivision(group.name) || group.name}</h2>
          <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-5">
            {group.teams.map((team) => {
              const color = teamColor(team.abbrev);
              const fg = onColor(color);
              return (
                <Link
                  key={team.id}
                  href={`/team/${team.id}`}
                  className="group overflow-hidden rounded-2xl border border-ink-950/10 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-card dark:border-white/10 dark:bg-ink-900"
                >
                  <div
                    className="flex items-center justify-between px-4 py-3"
                    style={{ backgroundColor: color, color: fg }}
                  >
                    <span className="font-display text-3xl leading-none tracking-wide">
                      {team.abbrev}
                    </span>
                    <span className="text-xs font-semibold uppercase tracking-wider opacity-80 transition group-hover:opacity-100">
                      Roster
                    </span>
                  </div>
                  <div className="px-4 py-3">
                    <p className="font-semibold leading-snug text-ink-950 dark:text-chalk">
                      {team.name}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}
