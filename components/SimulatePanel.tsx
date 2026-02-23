"use client";

import { useState } from "react";
import { SimCharts } from "./SimCharts";

export function SimulatePanel({ lineupId }: { lineupId: string }) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    runs_per_game: { mean: number; median: number; p10: number; p90: number };
    wins_per_162: { mean: number; std: number; histogram: number[] };
    playoff_odds: number;
    projected_stats?: Array<{
      player_id: string;
      name?: string;
      position: string;
      pa: number;
      ab: number;
      h: number;
      hr: number;
      bb: number;
      k: number;
      avg: number;
      obp: number;
      slg: number;
    }>;
    leaders?: {
      avg: Array<{ player_id: string; name?: string; position: string; value: number }>;
      obp: Array<{ player_id: string; name?: string; position: string; value: number }>;
      slg: Array<{ player_id: string; name?: string; position: string; value: number }>;
      hr: Array<{ player_id: string; name?: string; position: string; value: number }>;
    };
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const runSim = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch(`/api/lineups/${lineupId}/simulate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ n_seasons: 1000 }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? `Simulation failed (${res.status})`);
      }
      const data = await res.json();
      setResult(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Simulation failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={runSim}
          disabled={loading}
          className="rounded-lg bg-diamond-600 px-4 py-2 font-medium text-white transition hover:bg-diamond-700 disabled:opacity-50 dark:bg-diamond-500 dark:hover:bg-diamond-600"
        >
          {loading ? "Simulating…" : "Simulate season (1,000 runs)"}
        </button>
        <p className="text-sm text-stone-500 dark:text-stone-400">
          Runs 1,000 simulated 162-game seasons and shows wins distribution and
          playoff odds.
        </p>
      </div>
      {error && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 dark:border-amber-800 dark:bg-amber-950/30">
          <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
            Simulation unavailable
          </p>
          <p className="mt-1 text-sm text-amber-700 dark:text-amber-300">{error}</p>
        </div>
      )}
      {result && (
        <SimCharts
          runsPerGame={result.runs_per_game}
          winsPer162={result.wins_per_162}
          playoffOdds={result.playoff_odds}
          projectedStats={result.projected_stats ?? null}
          leaders={result.leaders ?? null}
        />
      )}
    </div>
  );
}
