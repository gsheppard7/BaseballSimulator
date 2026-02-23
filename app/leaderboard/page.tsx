"use client";

import { useState, useEffect } from "react";
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

export default function LeaderboardPage() {
  const [teamFilter, setTeamFilter] = useState("");
  const [constraintFilter, setConstraintFilter] = useState("");
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const params = new URLSearchParams();
    if (teamFilter) params.set("team", teamFilter);
    if (constraintFilter) params.set("constraint", constraintFilter);
    setLoading(true);
    fetch(`/api/leaderboard?${params}`)
      .then((r) => r.json())
      .then((data) => {
        setEntries(Array.isArray(data) ? data : []);
      })
      .finally(() => setLoading(false));
  }, [teamFilter, constraintFilter]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-stone-900 dark:text-stone-100">
        Leaderboard
      </h1>
      <p className="text-stone-600 dark:text-stone-400">
        Top lineups by score. Submit your lineup from the lineup page after
        saving and scoring. Filter by team or constraint (e.g. rookies, lefties).
      </p>
      <div className="flex flex-wrap gap-4">
        <div>
          <label className="block text-sm font-medium text-stone-700 dark:text-stone-300">
            Team (optional)
          </label>
          <input
            type="text"
            value={teamFilter}
            onChange={(e) => setTeamFilter(e.target.value)}
            placeholder="e.g. 147"
            className="mt-1 w-32 rounded border border-stone-300 bg-white px-2 py-1.5 text-sm dark:border-stone-600 dark:bg-stone-900 dark:text-stone-100"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-stone-700 dark:text-stone-300">
            Constraint (optional)
          </label>
          <input
            type="text"
            value={constraintFilter}
            onChange={(e) => setConstraintFilter(e.target.value)}
            placeholder="e.g. rookies"
            className="mt-1 w-32 rounded border border-stone-300 bg-white px-2 py-1.5 text-sm dark:border-stone-600 dark:bg-stone-900 dark:text-stone-100"
          />
        </div>
      </div>
      {loading ? (
        <p className="text-stone-500 dark:text-stone-400">Loading…</p>
      ) : entries.length === 0 ? (
        <p className="text-stone-500 dark:text-stone-400">
          No entries yet. Save a lineup, get a score, then submit it to the
          leaderboard from the lineup page.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-stone-200 dark:border-stone-700">
          <table className="w-full text-left text-sm">
            <thead className="bg-stone-100 dark:bg-stone-800">
              <tr>
                <th className="px-4 py-2 font-medium text-stone-700 dark:text-stone-300">
                  Rank
                </th>
                <th className="px-4 py-2 font-medium text-stone-700 dark:text-stone-300">
                  Display name
                </th>
                <th className="px-4 py-2 font-medium text-stone-700 dark:text-stone-300">
                  Team
                </th>
                <th className="px-4 py-2 font-medium text-stone-700 dark:text-stone-300">
                  Score
                </th>
                <th className="px-4 py-2 font-medium text-stone-700 dark:text-stone-300">
                  Tags
                </th>
                <th className="px-4 py-2 font-medium text-stone-700 dark:text-stone-300">
                  Link
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-200 dark:divide-stone-700">
              {entries.map((e, i) => (
                <tr key={e.id} className="bg-white dark:bg-stone-900">
                  <td className="px-4 py-2 text-stone-600 dark:text-stone-400">
                    {i + 1}
                  </td>
                  <td className="px-4 py-2 font-medium text-stone-900 dark:text-stone-100">
                    {e.displayName}
                  </td>
                  <td className="px-4 py-2 text-stone-600 dark:text-stone-400">
                    {e.teamName ?? e.teamId}
                  </td>
                  <td className="px-4 py-2 font-semibold text-stone-900 dark:text-stone-100">
                    {e.score}
                  </td>
                  <td className="px-4 py-2 text-stone-500 dark:text-stone-400">
                    {Array.isArray(e.constraintTags) && e.constraintTags.length > 0
                      ? e.constraintTags.join(", ")
                      : "—"}
                  </td>
                  <td className="px-4 py-2">
                    {e.shareSlug ? (
                      <Link
                        href={`/lineup/${e.shareSlug}`}
                        className="text-diamond-600 hover:underline dark:text-diamond-400"
                      >
                        View
                      </Link>
                    ) : (
                      "—"
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
