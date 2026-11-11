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
    <section className="surface p-4 sm:p-5">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="section-title">Season simulation</h2>
          <p className="mt-1 max-w-xl text-sm text-ink-900/60 dark:text-chalk/60">
            One thousand simulated 162-game seasons. Wins, playoff odds, and a projected stat line.
          </p>
        </div>
        <button type="button" onClick={runSim} disabled={loading} className="btn-primary">
          {loading ? "Simulating…" : "Run 1,000 seasons"}
        </button>
      </div>
      {loading && (
        <p className="mt-4 text-sm text-ink-900/60 dark:text-chalk/60">
          Playing out the schedule. This can take a moment.
        </p>
      )}
      {error && (
        <div className="mt-4 rounded-2xl border border-amber-300/80 bg-amber-50 p-4 dark:border-amber-700/60 dark:bg-amber-950/40">
          <p className="text-sm font-semibold text-amber-900 dark:text-amber-100">
            Simulation unavailable
          </p>
          <p className="mt-1 text-sm text-amber-800 dark:text-amber-200">{error}</p>
        </div>
      )}
      {result && (
        <div className="mt-5">
          <SimCharts
            runsPerGame={result.runs_per_game}
            winsPer162={result.wins_per_162}
            playoffOdds={result.playoff_odds}
            projectedStats={result.projected_stats ?? null}
            leaders={result.leaders ?? null}
          />
        </div>
      )}
    </section>
  );
}
