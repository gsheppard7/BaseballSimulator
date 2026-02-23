import Link from "next/link";

export const dynamic = "force-dynamic";

async function getTeams() {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const res = await fetch(`${base}/api/teams`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch teams");
  return res.json();
}

export default async function TeamSelectPage() {
  const teams = await getTeams();
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-stone-900 dark:text-stone-100">
        Pick a team
      </h1>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
        {teams.map((t: { id: string; name: string; abbrev: string; division?: string }) => (
          <Link
            key={t.id}
            href={`/team/${t.id}`}
            className="rounded-lg border border-stone-200 bg-white p-4 text-center shadow-sm transition hover:border-diamond-400 hover:shadow dark:border-stone-700 dark:bg-stone-900 dark:hover:border-diamond-600"
          >
            <span className="font-semibold text-stone-900 dark:text-stone-100">
              {t.name}
            </span>
            <span className="ml-1 text-stone-500 dark:text-stone-400">
              ({t.abbrev})
            </span>
            {t.division && (
              <p className="mt-1 text-xs text-stone-500 dark:text-stone-400">
                {t.division}
              </p>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}
