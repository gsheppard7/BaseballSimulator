import Link from "next/link";
import { DiamondSvg } from "@/components/DiamondSvg";

const STEPS = [
  {
    n: "01",
    title: "Pick a club",
    body: "Load an active MLB roster, with the bat, the glove, and last year’s slash line.",
  },
  {
    n: "02",
    title: "Set the card",
    body: "Click a spot in the order or on the diamond, then hand it to a player.",
  },
  {
    n: "03",
    title: "Run the season",
    body: "Score the lineup, simulate 1,000 seasons, and share the card.",
  },
];

export default function HomePage() {
  return (
    <div className="space-y-14">
      <section className="grid min-w-0 items-center gap-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(280px,0.9fr)]">
        <div className="min-w-0">
          <p className="page-kicker">Night game, blank card</p>
          <h1 className="mt-3 font-display text-5xl font-semibold leading-[0.95] tracking-wide text-ink-950 dark:text-chalk sm:text-7xl">
            Build the lineup.
            <span className="mt-1 block text-grass-700 dark:text-grass-400">See the season.</span>
          </h1>
          <p className="lede mt-5 text-lg">
            Choose a team, write a batting order, place the defense, and project
            how many runs that card scores.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/team/select" className="btn-primary px-6 py-3 text-base">
              Pick a team
            </Link>
            <Link href="/leaderboard" className="btn-secondary px-6 py-3 text-base">
              Leaderboard
            </Link>
          </div>
        </div>
        <div className="relative mx-auto w-full max-w-md">
          <div className="absolute inset-0 -z-10 rounded-[2rem] bg-grass-700/15 blur-2xl dark:bg-grass-500/15" />
          <DiamondSvg className="h-auto w-full drop-shadow-xl" />
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {STEPS.map((step) => (
          <article key={step.n} className="surface p-5">
            <p className="font-display text-3xl tracking-wide text-grass-700 dark:text-grass-400">
              {step.n}
            </p>
            <h2 className="mt-2 font-display text-2xl tracking-wide text-ink-950 dark:text-chalk">
              {step.title}
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-ink-900/70 dark:text-chalk/70">
              {step.body}
            </p>
          </article>
        ))}
      </section>
    </div>
  );
}
