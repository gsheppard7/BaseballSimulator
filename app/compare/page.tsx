"use client";

import { useState } from "react";
import { DeltaPanel } from "@/components/DeltaPanel";

export default function ComparePage() {
  const [slugA, setSlugA] = useState("");
  const [slugB, setSlugB] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    lineupA: { name?: string; shareSlug: string; score?: number; runsPerGame?: number };
    lineupB: { name?: string; shareSlug: string; score?: number; runsPerGame?: number };
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleCompare = async () => {
    if (!slugA.trim() || !slugB.trim()) {
      setError("Enter both lineup slugs.");
      return;
    }
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const [resA, resB] = await Promise.all([
        fetch(`/api/lineups?slug=${encodeURIComponent(slugA.trim())}`),
        fetch(`/api/lineups?slug=${encodeURIComponent(slugB.trim())}`),
      ]);
      if (!resA.ok || !resB.ok) {
        setError("One or both lineups not found. Check the share slugs.");
        return;
      }
      const lineupA = await resA.json();
      const lineupB = await resB.json();
      const [scoreA, scoreB] = await Promise.all([
        fetch(`/api/lineups/${lineupA.id}/score`).then((r) =>
          r.ok ? r.json() : ({} as { lineup_score?: number; lineupScore?: number; runs_per_game?: number; runsPerGame?: number })
        ),
        fetch(`/api/lineups/${lineupB.id}/score`).then((r) =>
          r.ok ? r.json() : ({} as { lineup_score?: number; lineupScore?: number; runs_per_game?: number; runsPerGame?: number })
        ),
      ]);
      setResult({
        lineupA: {
          name: lineupA.name,
          shareSlug: lineupA.shareSlug,
          score: scoreA.lineup_score ?? scoreA.lineupScore,
          runsPerGame: scoreA.runs_per_game ?? scoreA.runsPerGame,
        },
        lineupB: {
          name: lineupB.name,
          shareSlug: lineupB.shareSlug,
          score: scoreB.lineup_score ?? scoreB.lineupScore,
          runsPerGame: scoreB.runs_per_game ?? scoreB.runsPerGame,
        },
      });
    } catch (e) {
      setError("Failed to compare lineups.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-stone-900 dark:text-stone-100">
        Compare lineups
      </h1>
      <p className="text-stone-600 dark:text-stone-400">
        Enter two lineup share slugs (from the share link) to compare scores and
        runs per game head-to-head.
      </p>
      <div className="flex flex-wrap items-end gap-4">
        <div>
          <label className="block text-sm font-medium text-stone-700 dark:text-stone-300">
            Lineup A (slug)
          </label>
          <input
            type="text"
            value={slugA}
            onChange={(e) => setSlugA(e.target.value)}
            placeholder="e.g. abc123xyz"
            className="mt-1 w-48 rounded border border-stone-300 bg-white px-3 py-2 text-stone-900 dark:border-stone-600 dark:bg-stone-900 dark:text-stone-100"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-stone-700 dark:text-stone-300">
            Lineup B (slug)
          </label>
          <input
            type="text"
            value={slugB}
            onChange={(e) => setSlugB(e.target.value)}
            placeholder="e.g. def456uvw"
            className="mt-1 w-48 rounded border border-stone-300 bg-white px-3 py-2 text-stone-900 dark:border-stone-600 dark:bg-stone-900 dark:text-stone-100"
          />
        </div>
        <button
          type="button"
          onClick={handleCompare}
          disabled={loading}
          className="rounded-lg bg-diamond-600 px-4 py-2 font-medium text-white transition hover:bg-diamond-700 disabled:opacity-50 dark:bg-diamond-500 dark:hover:bg-diamond-600"
        >
          {loading ? "Loading…" : "Compare"}
        </button>
      </div>
      {error && (
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
      {result && (
        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-lg border border-stone-200 bg-white p-4 dark:border-stone-700 dark:bg-stone-900">
            <h2 className="font-semibold text-stone-900 dark:text-stone-100">
              {result.lineupA.name ?? "Lineup A"}
            </h2>
            <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">
              /lineup/{result.lineupA.shareSlug}
            </p>
            <p className="mt-2 text-lg font-semibold text-stone-900 dark:text-stone-100">
              Score {result.lineupA.score?.toFixed(1) ?? "—"}
              {result.lineupA.runsPerGame != null && (
                <span className="ml-2 text-base font-normal text-stone-500 dark:text-stone-400">
                  ({result.lineupA.runsPerGame.toFixed(2)} R/G)
                </span>
              )}
            </p>
          </div>
          <div className="rounded-lg border border-stone-200 bg-white p-4 dark:border-stone-700 dark:bg-stone-900">
            <h2 className="font-semibold text-stone-900 dark:text-stone-100">
              {result.lineupB.name ?? "Lineup B"}
            </h2>
            <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">
              /lineup/{result.lineupB.shareSlug}
            </p>
            <p className="mt-2 text-lg font-semibold text-stone-900 dark:text-stone-100">
              Score {result.lineupB.score?.toFixed(1) ?? "—"}
              {result.lineupB.runsPerGame != null && (
                <span className="ml-2 text-base font-normal text-stone-500 dark:text-stone-400">
                  ({result.lineupB.runsPerGame.toFixed(2)} R/G)
                </span>
              )}
            </p>
          </div>
        </div>
      )}
      {result && (
        <DeltaPanel
          beforeScore={result.lineupA.score ?? null}
          afterScore={result.lineupB.score ?? null}
          beforeRunsPerGame={result.lineupA.runsPerGame ?? null}
          afterRunsPerGame={result.lineupB.runsPerGame ?? null}
          label="Lineup B vs Lineup A"
        />
      )}
    </div>
  );
}
