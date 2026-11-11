"use client";

export function DeltaPanel({
  beforeScore,
  afterScore,
  beforeRunsPerGame,
  afterRunsPerGame,
  label = "After swap",
}: {
  beforeScore: number | null;
  afterScore: number | null;
  beforeRunsPerGame?: number | null;
  afterRunsPerGame?: number | null;
  label?: string;
}) {
  if (beforeScore == null && afterScore == null) return null;
  const scoreDelta =
    beforeScore != null && afterScore != null ? afterScore - beforeScore : null;
  const runsDelta =
    beforeRunsPerGame != null && afterRunsPerGame != null
      ? afterRunsPerGame - beforeRunsPerGame
      : null;
  const ahead = scoreDelta != null && scoreDelta > 0;
  const behind = scoreDelta != null && scoreDelta < 0;

  return (
    <div className="surface p-5">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h3 className="section-title">{label}</h3>
          <p className="mt-1 text-sm text-ink-900/60 dark:text-chalk/60">
            {scoreDelta == null
              ? "One score is still missing."
              : ahead
                ? "The after score is higher."
                : behind
                  ? "The before score is higher."
                  : "The scores match."}
          </p>
        </div>
        {scoreDelta != null && (
          <p
            className={`font-display text-5xl tabular-nums leading-none ${
              ahead
                ? "text-grass-700 dark:text-grass-400"
                : behind
                  ? "text-stitch-600"
                  : "text-ink-950 dark:text-chalk"
            }`}
          >
            {scoreDelta > 0 ? "+" : ""}
            {scoreDelta.toFixed(1)}
          </p>
        )}
      </div>
      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <div className="rounded-2xl bg-ink-950/[0.04] p-4 dark:bg-white/[0.04]">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-900/50 dark:text-chalk/50">
            First
          </p>
          <p className="mt-1 font-display text-3xl tabular-nums text-ink-950 dark:text-chalk">
            {beforeScore?.toFixed(1) ?? "—"}
          </p>
          {beforeRunsPerGame != null && (
            <p className="text-sm text-ink-900/60 dark:text-chalk/60">
              {beforeRunsPerGame.toFixed(2)} runs / game
            </p>
          )}
        </div>
        <div className="rounded-2xl bg-ink-950/[0.04] p-4 dark:bg-white/[0.04]">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-900/50 dark:text-chalk/50">
            Second
          </p>
          <p className="mt-1 font-display text-3xl tabular-nums text-ink-950 dark:text-chalk">
            {afterScore?.toFixed(1) ?? "—"}
          </p>
          {afterRunsPerGame != null && (
            <p className="text-sm text-ink-900/60 dark:text-chalk/60">
              {afterRunsPerGame.toFixed(2)} runs / game
            </p>
          )}
        </div>
      </div>
      {runsDelta != null && (
        <p
          className={`mt-4 text-sm font-semibold tabular-nums ${
            runsDelta >= 0 ? "text-grass-700 dark:text-grass-400" : "text-stitch-600"
          }`}
        >
          Runs / game {runsDelta >= 0 ? "+" : ""}
          {runsDelta.toFixed(2)}
        </p>
      )}
    </div>
  );
}
