import Link from "next/link";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

async function getRoster(teamId: string) {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const res = await fetch(`${base}/api/teams/${teamId}/roster`, {
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
  const roster = await getRoster(teamId);
  if (roster === null) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-stone-900 dark:text-stone-100">
          Roster
        </h1>
        <Link
          href={`/lineup/new?team=${teamId}`}
          className="rounded-lg bg-diamond-600 px-4 py-2 font-medium text-white transition hover:bg-diamond-700 dark:bg-diamond-500 dark:hover:bg-diamond-600"
        >
          Build lineup
        </Link>
      </div>
      <p className="text-stone-600 dark:text-stone-400">
        {roster.length} players. Build a lineup to set batting order and
        positions, then simulate.
      </p>
      <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {roster.map(
          (p: {
            id: string;
            name: string;
            positions: string;
            batSide: string | null;
            obp: string | null;
            slg: string | null;
          }) => (
            <li
              key={p.id}
              className="flex items-center gap-3 rounded-lg border border-stone-200 bg-white p-3 dark:border-stone-700 dark:bg-stone-900"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-stone-200 text-sm font-medium text-stone-700 dark:bg-stone-600 dark:text-stone-200">
                {p.name
                  .split(" ")
                  .map((n: string) => n[0])
                  .join("")
                  .slice(0, 2)}
              </div>
              <div>
                <span className="font-medium text-stone-900 dark:text-stone-100">
                  {p.name}
                </span>
                <span className="ml-1 text-stone-500 dark:text-stone-400">
                  {p.positions}
                  {p.batSide ? ` · ${p.batSide}` : ""}
                </span>
                {(p.obp != null || p.slg != null) && (
                  <p className="text-xs text-stone-500 dark:text-stone-400">
                    OBP {p.obp ?? "—"} / SLG {p.slg ?? "—"}
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
