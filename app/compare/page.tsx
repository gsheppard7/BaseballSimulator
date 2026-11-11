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
        setError("One or both lineups were not found. Check the share slugs.");
        return;
      }
      const lineupA = await resA.json();
      const lineupB = await resB.json();
      const [scoreA, scoreB] = await Promise.all([
        fetch(`/api/lineups/${lineupA.id}/score`).then((response) =>
          response.ok
            ? response.json()
            : ({} as {
                lineup_score?: number;
                lineupScore?: number;
                runs_per_game?: number;
                runsPerGame?: number;
              })
        ),
        fetch(`/api/lineups/${lineupB.id}/score`).then((response) =>
          response.ok
            ? response.json()
            : ({} as {
                lineup_score?: number;
                lineupScore?: number;
                runs_per_game?: number;
                runsPerGame?: number;
              })
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
    } catch {
      setError("Failed to compare lineups.");
    } finally {
      setLoading(false);
    }
  };

  const leader =
    result?.lineupA.score != null && result.lineupB.score != null
      ? result.lineupA.score === result.lineupB.score
        ? "tie"
        : result.lineupA.score > result.lineupB.score
          ? "a"
          : "b"
      : null;

  return (
    <div className="space-y-8">
      <header>
        <p className="page-kicker">Head to head</p>
        <h1 className="page-title mt-2">Compare lineups</h1>
        <p className="lede mt-3">
          Paste two share slugs to put the scores and runs per game next to each other.
        </p>
      </header>

      <form
        className="surface flex flex-wrap items-end gap-4 p-4 sm:p-5"
        onSubmit={(event) => {
          event.preventDefault();
          handleCompare();
        }}
      >
        <label className="block min-w-[12rem] flex-1 text-xs font-semibold uppercase tracking-[0.16em] text-ink-900/50 dark:text-chalk/50">
          Lineup A
          <input
            type="text"
            value={slugA}
            onChange={(event) => setSlugA(event.target.value)}
            placeholder="Share slug"
            className="field mt-1 normal-case tracking-normal"
          />
        </label>
        <p className="hidden pb-2 font-display text-2xl tracking-wide text-ink-900/40 sm:block dark:text-chalk/40">
          VS
        </p>
        <label className="block min-w-[12rem] flex-1 text-xs font-semibold uppercase tracking-[0.16em] text-ink-900/50 dark:text-chalk/50">
          Lineup B
          <input
            type="text"
            value={slugB}
            onChange={(event) => setSlugB(event.target.value)}
            placeholder="Share slug"
            className="field mt-1 normal-case tracking-normal"
          />
        </label>
        <button type="submit" disabled={loading} className="btn-primary">
          {loading ? "Scoring…" : "Compare"}
        </button>
      </form>

      {error && (
        <p className="rounded-2xl border border-stitch-500/30 bg-stitch-500/10 px-4 py-3 text-sm text-stitch-600">
          {error}
        </p>
      )}

      {result && (
        <div className="grid items-stretch gap-4 md:grid-cols-[1fr_auto_1fr]">
          <LineupCard
            kicker="Lineup A"
            name={result.lineupA.name ?? "Lineup A"}
            slug={result.lineupA.shareSlug}
            score={result.lineupA.score}
            runsPerGame={result.lineupA.runsPerGame}
            leading={leader === "a"}
          />
          <div className="grid place-items-center font-display text-3xl tracking-wide text-ink-900/35 dark:text-chalk/35">
            VS
          </div>
          <LineupCard
            kicker="Lineup B"
            name={result.lineupB.name ?? "Lineup B"}
            slug={result.lineupB.shareSlug}
            score={result.lineupB.score}
            runsPerGame={result.lineupB.runsPerGame}
            leading={leader === "b"}
          />
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

function LineupCard({
  kicker,
  name,
  slug,
  score,
  runsPerGame,
  leading,
}: {
  kicker: string;
  name: string;
  slug: string;
  score?: number;
  runsPerGame?: number;
  leading: boolean;
}) {
  return (
    <article
      className={`rounded-3xl p-5 ${
        leading
          ? "bg-ink-950 text-chalk shadow-card"
          : "surface"
      }`}
    >
      <div className="flex items-center justify-between gap-3">
        <p className={`text-[11px] font-semibold uppercase tracking-[0.18em] ${leading ? "text-white/55" : "text-ink-900/50 dark:text-chalk/50"}`}>
          {kicker}
        </p>
        {leading && (
          <span className="rounded-full bg-grass-500 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-ink-950">
            Ahead
          </span>
        )}
      </div>
      <h2 className={`mt-2 font-display text-3xl tracking-wide ${leading ? "text-chalk" : "text-ink-950 dark:text-chalk"}`}>
        {name}
      </h2>
      <p className={`mt-1 text-sm ${leading ? "text-white/55" : "text-ink-900/50 dark:text-chalk/50"}`}>
        /lineup/{slug}
      </p>
      <p className={`mt-4 font-display text-5xl tabular-nums leading-none ${leading ? "text-chalk" : "text-ink-950 dark:text-chalk"}`}>
        {score?.toFixed(1) ?? "—"}
      </p>
      {runsPerGame != null && (
        <p className={`mt-2 text-sm ${leading ? "text-white/70" : "text-ink-900/60 dark:text-chalk/60"}`}>
          {runsPerGame.toFixed(2)} runs / game
        </p>
      )}
    </article>
  );
}
