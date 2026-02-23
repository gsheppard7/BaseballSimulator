"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

export interface ProjectedPlayerStatRow {
  player_id: string;
  name?: string;
  position: string;
  pa: number;
  ab: number;
  h: number;
  single?: number;
  double?: number;
  triple?: number;
  hr: number;
  bb: number;
  k: number;
  avg: number;
  obp: number;
  slg: number;
}

export interface StatLeaderRow {
  player_id: string;
  name?: string;
  position: string;
  value: number;
  stat: string;
}

interface SimChartsProps {
  runsPerGame: { mean: number; median: number; p10: number; p90: number };
  winsPer162: { mean: number; std: number; histogram: number[] };
  playoffOdds: number;
  projectedStats?: ProjectedPlayerStatRow[] | null;
  leaders?: {
    avg: StatLeaderRow[];
    obp: StatLeaderRow[];
    slg: StatLeaderRow[];
    hr: StatLeaderRow[];
  } | null;
}

export function SimCharts({
  runsPerGame,
  winsPer162,
  playoffOdds,
  projectedStats,
  leaders,
}: SimChartsProps) {
  const winMin = Math.max(0, Math.floor(winsPer162.mean - winsPer162.std * 3));
  const winMax = Math.min(162, Math.ceil(winsPer162.mean + winsPer162.std * 3));
  const binCount = winsPer162.histogram.length;
  const binWidth =
    binCount > 0 ? (winMax - winMin) / binCount || 1 : 1;
  const histogramData = winsPer162.histogram.map((count, i) => ({
    wins: Math.round(winMin + (i + 0.5) * binWidth),
    count,
  }));

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-stone-200 bg-white p-4 dark:border-stone-700 dark:bg-stone-900">
          <p className="text-sm text-stone-500 dark:text-stone-400">
            Runs / game (mean)
          </p>
          <p className="text-2xl font-bold text-stone-900 dark:text-stone-100">
            {runsPerGame.mean.toFixed(2)}
          </p>
          <p className="text-xs text-stone-500 dark:text-stone-400">
            Median {runsPerGame.median.toFixed(2)} · 10th %ile {runsPerGame.p10.toFixed(2)} · 90th %ile {runsPerGame.p90.toFixed(2)}
          </p>
        </div>
        <div className="rounded-lg border border-stone-200 bg-white p-4 dark:border-stone-700 dark:bg-stone-900">
          <p className="text-sm text-stone-500 dark:text-stone-400">
            Wins per 162
          </p>
          <p className="text-2xl font-bold text-stone-900 dark:text-stone-100">
            {winsPer162.mean.toFixed(1)}
          </p>
          <p className="text-xs text-stone-500 dark:text-stone-400">
            Std dev {winsPer162.std.toFixed(1)}
          </p>
        </div>
        <div className="rounded-lg border border-stone-200 bg-white p-4 dark:border-stone-700 dark:bg-stone-900">
          <p className="text-sm text-stone-500 dark:text-stone-400">
            Playoff odds (90+ wins)
          </p>
          <p className="text-2xl font-bold text-diamond-600 dark:text-diamond-400">
            {(playoffOdds * 100).toFixed(1)}%
          </p>
        </div>
      </div>
      <div className="rounded-lg border border-stone-200 bg-white p-4 dark:border-stone-700 dark:bg-stone-900">
        <h3 className="text-sm font-medium text-stone-700 dark:text-stone-300">
          Season wins distribution
        </h3>
        <div className="mt-2 h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={histogramData} margin={{ top: 8, right: 8, left: 8, bottom: 8 }}>
              <XAxis
                dataKey="wins"
                tick={{ fontSize: 12 }}
                stroke="currentColor"
                className="text-stone-500"
              />
              <YAxis
                tick={{ fontSize: 12 }}
                stroke="currentColor"
                className="text-stone-500"
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--tw-bg-opacity, 1)",
                  border: "1px solid #e5e7eb",
                  borderRadius: "0.5rem",
                }}
                labelFormatter={(w) => `Wins: ${w}`}
              />
              <Bar dataKey="count" fill="#16a34a" radius={[2, 2, 0, 0]}>
                {histogramData.map((_, i) => (
                  <Cell key={i} fill="#16a34a" />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {projectedStats && projectedStats.length > 0 && (
        <div className="rounded-lg border border-stone-200 bg-white p-4 dark:border-stone-700 dark:bg-stone-900">
          <h3 className="mb-3 text-sm font-medium text-stone-700 dark:text-stone-300">
            Projected stats (one simulated season)
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-stone-200 dark:border-stone-600">
                  <th className="pb-2 pr-2 font-medium text-stone-700 dark:text-stone-300">Player</th>
                  <th className="pb-2 pr-2 font-medium text-stone-700 dark:text-stone-300">Pos</th>
                  <th className="pb-2 pr-2 font-medium text-stone-700 dark:text-stone-300">PA</th>
                  <th className="pb-2 pr-2 font-medium text-stone-700 dark:text-stone-300">AB</th>
                  <th className="pb-2 pr-2 font-medium text-stone-700 dark:text-stone-300">H</th>
                  <th className="pb-2 pr-2 font-medium text-stone-700 dark:text-stone-300">HR</th>
                  <th className="pb-2 pr-2 font-medium text-stone-700 dark:text-stone-300">BB</th>
                  <th className="pb-2 pr-2 font-medium text-stone-700 dark:text-stone-300">K</th>
                  <th className="pb-2 pr-2 font-medium text-stone-700 dark:text-stone-300">AVG</th>
                  <th className="pb-2 pr-2 font-medium text-stone-700 dark:text-stone-300">OBP</th>
                  <th className="pb-2 pr-2 font-medium text-stone-700 dark:text-stone-300">SLG</th>
                </tr>
              </thead>
              <tbody>
                {projectedStats.map((p, i) => (
                  <tr key={p.player_id || i} className="border-b border-stone-100 dark:border-stone-800">
                    <td className="py-1.5 pr-2 font-medium text-stone-900 dark:text-stone-100">
                      {p.name ?? p.player_id}
                    </td>
                    <td className="py-1.5 pr-2 text-stone-600 dark:text-stone-400">{p.position}</td>
                    <td className="py-1.5 pr-2 text-stone-600 dark:text-stone-400">{p.pa}</td>
                    <td className="py-1.5 pr-2 text-stone-600 dark:text-stone-400">{p.ab}</td>
                    <td className="py-1.5 pr-2 text-stone-600 dark:text-stone-400">{p.h}</td>
                    <td className="py-1.5 pr-2 text-stone-600 dark:text-stone-400">{p.hr}</td>
                    <td className="py-1.5 pr-2 text-stone-600 dark:text-stone-400">{p.bb}</td>
                    <td className="py-1.5 pr-2 text-stone-600 dark:text-stone-400">{p.k}</td>
                    <td className="py-1.5 pr-2 text-stone-600 dark:text-stone-400">{p.avg.toFixed(3)}</td>
                    <td className="py-1.5 pr-2 text-stone-600 dark:text-stone-400">{p.obp.toFixed(3)}</td>
                    <td className="py-1.5 pr-2 text-stone-600 dark:text-stone-400">{p.slg.toFixed(3)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {leaders && (
        <div className="rounded-lg border border-stone-200 bg-white p-4 dark:border-stone-700 dark:bg-stone-900">
          <h3 className="mb-3 text-sm font-medium text-stone-700 dark:text-stone-300">
            Team leaders (projected)
          </h3>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <p className="text-xs font-medium uppercase text-stone-500 dark:text-stone-400">AVG</p>
              <ul className="mt-1 space-y-0.5 text-sm">
                {leaders.avg.map((l, i) => (
                  <li key={l.player_id + l.stat}>
                    {i + 1}. {l.name ?? l.player_id} <span className="text-stone-500">({l.value.toFixed(3)})</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-xs font-medium uppercase text-stone-500 dark:text-stone-400">OBP</p>
              <ul className="mt-1 space-y-0.5 text-sm">
                {leaders.obp.map((l, i) => (
                  <li key={l.player_id + l.stat}>
                    {i + 1}. {l.name ?? l.player_id} <span className="text-stone-500">({l.value.toFixed(3)})</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-xs font-medium uppercase text-stone-500 dark:text-stone-400">SLG</p>
              <ul className="mt-1 space-y-0.5 text-sm">
                {leaders.slg.map((l, i) => (
                  <li key={l.player_id + l.stat}>
                    {i + 1}. {l.name ?? l.player_id} <span className="text-stone-500">({l.value.toFixed(3)})</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-xs font-medium uppercase text-stone-500 dark:text-stone-400">HR</p>
              <ul className="mt-1 space-y-0.5 text-sm">
                {leaders.hr.map((l, i) => (
                  <li key={l.player_id + l.stat}>
                    {i + 1}. {l.name ?? l.player_id} <span className="text-stone-500">({l.value})</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
