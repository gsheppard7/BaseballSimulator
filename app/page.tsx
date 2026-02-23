import Link from "next/link";

export default function HomePage() {
  return (
    <div className="space-y-10">
      <section className="text-center">
        <h1 className="text-4xl font-bold tracking-tight text-stone-900 dark:text-stone-100">
          Baseball Lineup Simulator
        </h1>
        <p className="mt-4 text-lg text-stone-600 dark:text-stone-400">
          Pick a team, build your lineup, and see how it projects.
        </p>
      </section>
      <section className="flex justify-center">
        <Link
          href="/team/select"
          className="rounded-lg bg-diamond-600 px-8 py-4 text-lg font-medium text-white shadow-md transition hover:bg-diamond-700 dark:bg-diamond-500 dark:hover:bg-diamond-600"
        >
          Pick a team
        </Link>
      </section>
      <section className="mx-auto max-w-xl rounded-xl border border-stone-200 bg-white p-6 dark:border-stone-800 dark:bg-stone-900">
        <h2 className="text-lg font-semibold text-stone-900 dark:text-stone-100">
          How it works
        </h2>
        <ul className="mt-3 list-inside list-disc space-y-1 text-stone-600 dark:text-stone-400">
          <li>Choose an MLB team and load its roster</li>
          <li>Drag players into batting order and field positions</li>
          <li>Run a season simulation (1,000+ sims)</li>
          <li>Share your lineup and compare with others</li>
        </ul>
      </section>
    </div>
  );
}
