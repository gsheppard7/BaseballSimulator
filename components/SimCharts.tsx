"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
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
  stat?: string;
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

function rate(value: number): string {
  return value.toFixed(3).replace(/^0/, "");
}

function LeaderList({
  title,
  rows,
  format,
}: {
  title: string;
  rows: StatLeaderRow[];
  format: (value: number) => string;
}) {
  return (
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-900/50 dark:text-chalk/50">
        {title}
      </p>
      <ol className="mt-2 space-y-1.5">
        {rows.map((row, index) => (
          <li key={`${row.player_id}-${index}`} className="flex items-baseline justify-between gap-3 text-sm">
            <span className="truncate text-ink-950 dark:text-chalk">
              <span className="mr-2 font-display text-grass-700 dark:text-grass-400">{index + 1}</span>
              {row.name ?? row.player_id}
            </span>
            <span className="tabular-nums text-ink-900/60 dark:text-chalk/60">{format(row.value)}</span>
          </li>
        ))}
      </ol>
    </div>
  );
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
  const binWidth = binCount > 0 ? (winMax - winMin) / binCount || 1 : 1;
  const histogramData = winsPer162.histogram.map((count, index) => ({
    wins: Math.round(winMin + (index + 0.5) * binWidth),
    count,
  }));
  const oddsPct = Math.max(0, Math.min(100, playoffOdds * 100));

  return (
    <div className="space-y-5">
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl bg-ink-950 px-4 py-4 text-chalk">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/55">
            Runs / game
          </p>
          <p className="mt-1 font-display text-4xl tabular-nums leading-none">
            {runsPerGame.mean.toFixed(2)}
          </p>
          <p className="mt-2 text-xs text-white/60">
            Median {runsPerGame.median.toFixed(2)} · {runsPerGame.p10.toFixed(2)} to {runsPerGame.p90.toFixed(2)}
          </p>
        </div>
        <div className="rounded-2xl bg-grass-700 px-4 py-4 text-white">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/70">
            Wins per 162
          </p>
          <p className="mt-1 font-display text-4xl tabular-nums leading-none">
            {winsPer162.mean.toFixed(1)}
          </p>
          <p className="mt-2 text-xs text-white/75">Spread {winsPer162.std.toFixed(1)} wins</p>
        </div>
        <div className="rounded-2xl border border-ink-950/10 bg-white px-4 py-4 dark:border-white/10 dark:bg-ink-950/40">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-900/50 dark:text-chalk/50">
            Playoff odds
          </p>
          <p className="mt-1 font-display text-4xl tabular-nums leading-none text-ink-950 dark:text-chalk">
            {oddsPct.toFixed(1)}%
          </p>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-ink-950/10 dark:bg-white/10">
            <div className="h-full rounded-full bg-stitch-500" style={{ width: `${oddsPct}%` }} />
          </div>
          <p className="mt-2 text-xs text-ink-900/50 dark:text-chalk/50">Share of seasons with 90+ wins</p>
        </div>
      </div>

      <div className="rounded-2xl border border-ink-950/10 bg-white p-4 dark:border-white/10 dark:bg-ink-950/40">
        <h3 className="font-display text-xl tracking-wide text-ink-950 dark:text-chalk">
          Season wins
        </h3>
        <div className="mt-3 h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={histogramData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <XAxis
                dataKey="wins"
                tick={{ fontSize: 12, fill: "currentColor" }}
                stroke="currentColor"
                className="text-ink-900/50"
              />
              <YAxis
                tick={{ fontSize: 12, fill: "currentColor" }}
                stroke="currentColor"
                className="text-ink-900/50"
                width={32}
              />
              <Tooltip
                cursor={{ fill: "rgba(20, 110, 54, 0.08)" }}
                contentStyle={{
                  backgroundColor: "#121c33",
                  border: "none",
                  borderRadius: "0.75rem",
                  color: "#f6f1e7",
                }}
                labelFormatter={(wins) => `${wins} wins`}
              />
              <Bar dataKey="count" fill="#146e36" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {projectedStats && projectedStats.length > 0 && (
        <div className="overflow-hidden rounded-2xl border border-ink-950/10 dark:border-white/10">
          <div className="border-b border-ink-950/10 px-4 py-3 dark:border-white/10">
            <h3 className="font-display text-xl tracking-wide text-ink-950 dark:text-chalk">
              Projected season
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm tabular-nums">
              <thead className="bg-ink-950/[0.03] text-[11px] uppercase tracking-[0.14em] text-ink-900/50 dark:bg-white/[0.04] dark:text-chalk/50">
                <tr>
                  {["Player", "Pos", "PA", "AB", "H", "HR", "BB", "K", "AVG", "OBP", "SLG"].map((heading) => (
                    <th key={heading} className="px-3 py-2 font-semibold">
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {projectedStats.map((player, index) => (
                  <tr
                    key={player.player_id || index}
                    className="border-t border-ink-950/5 odd:bg-white even:bg-ink-950/[0.02] dark:border-white/5 dark:odd:bg-transparent dark:even:bg-white/[0.03]"
                  >
                    <td className="whitespace-nowrap px-3 py-2 font-semibold text-ink-950 dark:text-chalk">
                      {player.name ?? player.player_id}
                    </td>
                    <td className="px-3 py-2 text-ink-900/70 dark:text-chalk/70">{player.position}</td>
                    <td className="px-3 py-2">{player.pa}</td>
                    <td className="px-3 py-2">{player.ab}</td>
                    <td className="px-3 py-2">{player.h}</td>
                    <td className="px-3 py-2">{player.hr}</td>
                    <td className="px-3 py-2">{player.bb}</td>
                    <td className="px-3 py-2">{player.k}</td>
                    <td className="px-3 py-2">{rate(player.avg)}</td>
                    <td className="px-3 py-2">{rate(player.obp)}</td>
                    <td className="px-3 py-2">{rate(player.slg)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {leaders && (
        <div className="rounded-2xl border border-ink-950/10 p-4 dark:border-white/10">
          <h3 className="font-display text-xl tracking-wide text-ink-950 dark:text-chalk">
            Team leaders
          </h3>
          <div className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <LeaderList title="AVG" rows={leaders.avg} format={rate} />
            <LeaderList title="OBP" rows={leaders.obp} format={rate} />
            <LeaderList title="SLG" rows={leaders.slg} format={rate} />
            <LeaderList title="HR" rows={leaders.hr} format={(value) => String(value)} />
          </div>
        </div>
      )}
    </div>
  );
}
