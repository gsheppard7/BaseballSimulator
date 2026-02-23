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

  return (
    <div className="rounded-lg border border-stone-200 bg-stone-50 p-4 dark:border-stone-700 dark:bg-stone-900/50">
      <h3 className="text-sm font-medium text-stone-700 dark:text-stone-300">
        {label}
      </h3>
      <div className="mt-2 grid grid-cols-2 gap-4 text-sm">
        <div>
          <span className="text-stone-500 dark:text-stone-400">Before</span>
          <p className="font-medium text-stone-900 dark:text-stone-100">
            Score {beforeScore ?? "—"}
            {beforeRunsPerGame != null && (
              <span className="ml-1 text-stone-500 dark:text-stone-400">
                ({beforeRunsPerGame.toFixed(2)} R/G)
              </span>
            )}
          </p>
        </div>
        <div>
          <span className="text-stone-500 dark:text-stone-400">After</span>
          <p className="font-medium text-stone-900 dark:text-stone-100">
            Score {afterScore ?? "—"}
            {afterRunsPerGame != null && (
              <span className="ml-1 text-stone-500 dark:text-stone-400">
                ({afterRunsPerGame.toFixed(2)} R/G)
              </span>
            )}
          </p>
        </div>
      </div>
      {(scoreDelta != null || runsDelta != null) && (
        <p className="mt-2 text-sm">
          {scoreDelta != null && (
            <span
              className={
                scoreDelta >= 0
                  ? "text-diamond-600 dark:text-diamond-400"
                  : "text-red-600 dark:text-red-400"
              }
            >
              Score {scoreDelta >= 0 ? "+" : ""}
              {scoreDelta.toFixed(1)}
            </span>
          )}
          {runsDelta != null && (
            <span
              className={
                runsDelta >= 0
                  ? "ml-2 text-diamond-600 dark:text-diamond-400"
                  : "ml-2 text-red-600 dark:text-red-400"
              }
            >
              Runs/game {runsDelta >= 0 ? "+" : ""}
              {runsDelta.toFixed(2)}
            </span>
          )}
        </p>
      )}
    </div>
  );
}
