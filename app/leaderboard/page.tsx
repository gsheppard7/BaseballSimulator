"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Entry {
  id: string;
  lineupId: string;
  shareSlug: string | null;
  teamId: string;
  teamName: string | null;
  score: string;
  constraintTags: string[] | null;
  displayName: string;
  createdAt: string;
}

interface TeamOption {
  id: string;
  name: string;
  abbrev: string;
}

function formatScore(score: string): string {
  const value = Number(score);
  return Number.isFinite(value) ? value.toFixed(1) : score;
}

export default function LeaderboardPage() {
  const [teamFilter, setTeamFilter] = useState("");
  const [constraintFilter, setConstraintFilter] = useState("");
  const [entries, setEntries] = useState<Entry[]>([]);
  const [teams, setTeams] = useState<TeamOption[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/teams")
      .then((response) => response.json())
      .then((data) => {
        if (Array.isArray(data)) setTeams(data);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const params = new URLSearchParams();
    if (teamFilter) params.set("team", teamFilter);
    if (constraintFilter) params.set("constraint", constraintFilter);
    setLoading(true);
    fetch(`/api/leaderboard?${params}`)
      .then((response) => response.json())
      .then((data) => {
        setEntries(Array.isArray(data) ? data : []);
      })
      .finally(() => setLoading(false));
  }, [teamFilter, constraintFilter]);

  return (
    <div className="space-y-8">
      <header>
        <p className="page-kicker">Best cards</p>
        <h1 className="page-title mt-2">Leaderboard</h1>
        <p className="lede mt-3">
          Lineups ranked by score. Save a card, score it, then submit it from the lineup page.
        </p>
      </header>

      <div className="surface grid gap-4 p-4 sm:grid-cols-2 sm:p-5">
        <label className="block text-xs font-semibold uppercase tracking-[0.16em] text-ink-900/50 dark:text-chalk/50">
          Team
          <select
            value={teamFilter}
            onChange={(event) => setTeamFilter(event.target.value)}
            className="field mt-1"
          >
            <option value="">All teams</option>
            {teams.map((team) => (
              <option key={team.id} value={team.id}>
                {team.name}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-xs font-semibold uppercase tracking-[0.16em] text-ink-900/50 dark:text-chalk/50">
          Tag
          <input
            type="text"
            value={constraintFilter}
            onChange={(event) => setConstraintFilter(event.target.value)}
            placeholder="rookies"
            className="field mt-1 normal-case tracking-normal"
          />
        </label>
      </div>

      {loading ? (
        <p className="text-sm text-ink-900/60 dark:text-chalk/60">Loading the board…</p>
      ) : entries.length === 0 ? (
        <div className="surface border-dashed px-6 py-12 text-center">
          <h2 className="section-title">No cards posted yet</h2>
          <p className="lede mx-auto mt-2">
            Save a lineup, get a score, then submit it from the lineup page.
          </p>
          <Link href="/team/select" className="btn-primary mt-6">
            Build a lineup
          </Link>
        </div>
      ) : (
        <div className="surface overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-ink-950 text-[11px] uppercase tracking-[0.16em] text-white/70">
                <tr>
                  <th className="px-4 py-3 font-semibold">Rank</th>
                  <th className="px-4 py-3 font-semibold">Name</th>
                  <th className="px-4 py-3 font-semibold">Team</th>
                  <th className="px-4 py-3 font-semibold">Score</th>
                  <th className="px-4 py-3 font-semibold">Tags</th>
                  <th className="px-4 py-3 font-semibold">Card</th>
                </tr>
              </thead>
              <tbody>
                {entries.map((entry, index) => (
                  <tr
                    key={entry.id}
                    className="border-t border-ink-950/10 dark:border-white/10"
                  >
                    <td className="px-4 py-3">
                      <span
                        className={`font-display text-2xl tabular-nums ${
                          index === 0
                            ? "text-clay-700"
                            : index === 1
                              ? "text-ink-300"
                              : index === 2
                                ? "text-stitch-600"
                                : "text-ink-900/40 dark:text-chalk/40"
                        }`}
                      >
                        {index + 1}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-semibold text-ink-950 dark:text-chalk">
                      {entry.displayName}
                    </td>
                    <td className="px-4 py-3 text-ink-900/70 dark:text-chalk/70">
                      {entry.teamName ?? entry.teamId}
                    </td>
                    <td className="px-4 py-3 font-display text-2xl tabular-nums text-ink-950 dark:text-chalk">
                      {formatScore(entry.score)}
                    </td>
                    <td className="px-4 py-3">
                      {Array.isArray(entry.constraintTags) && entry.constraintTags.length > 0 ? (
                        <span className="flex flex-wrap gap-1">
                          {entry.constraintTags.map((tag) => (
                            <span
                              key={tag}
                              className="rounded-full bg-ink-950/5 px-2 py-0.5 text-xs text-ink-900/70 dark:bg-white/10 dark:text-chalk/70"
                            >
                              {tag}
                            </span>
                          ))}
                        </span>
                      ) : (
                        <span className="text-ink-900/30 dark:text-chalk/30">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {entry.shareSlug ? (
                        <Link
                          href={`/lineup/${entry.shareSlug}`}
                          className="font-semibold text-grass-800 hover:underline dark:text-grass-400"
                        >
                          View
                        </Link>
                      ) : (
                        <span className="text-ink-900/30 dark:text-chalk/30">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
