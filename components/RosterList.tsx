"use client";

import { useMemo, useState } from "react";
import type { PlayerItem } from "./LineupBuilder";
import { BatBadge, PlayerAvatar } from "./PlayerAvatar";

function RosterItem({
  player,
  isAssignMode,
  inLineup,
  onSelect,
}: {
  player: PlayerItem;
  isAssignMode: boolean;
  inLineup: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={isAssignMode ? onSelect : undefined}
      className={`flex w-full items-center gap-2.5 rounded-xl border px-2.5 py-2 text-left transition ${
        isAssignMode
          ? "border-grass-700/30 bg-white hover:border-grass-700 hover:bg-grass-50 dark:border-grass-400/30 dark:bg-ink-950/40 dark:hover:bg-grass-900/30"
          : "cursor-default border-transparent bg-ink-950/[0.03] dark:bg-white/[0.04]"
      }`}
    >
      <PlayerAvatar name={player.name} url={player.headshotUrl} size="sm" />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <p className="truncate text-sm font-semibold text-ink-950 dark:text-chalk">{player.name}</p>
          <BatBadge side={player.batSide} />
        </div>
        <p className="truncate text-xs text-ink-900/55 dark:text-chalk/55">
          {player.positions}
          {(player.obp || player.slg) && (
            <span className="tabular-nums">
              {" "}
              · {player.obp ?? "—"} / {player.slg ?? "—"}
            </span>
          )}
        </p>
      </div>
      {inLineup && (
        <span className="shrink-0 rounded-full bg-grass-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-grass-800 dark:bg-grass-900 dark:text-grass-300">
          In
        </span>
      )}
    </button>
  );
}

export function RosterList({
  roster,
  selectedSlot,
  slotLabel,
  assignedIds,
  onSelectPlayer,
}: {
  roster: PlayerItem[];
  selectedSlot: string | null;
  slotLabel?: string;
  assignedIds: string[];
  onSelectPlayer: (player: PlayerItem) => void;
}) {
  const [search, setSearch] = useState("");
  const assigned = useMemo(() => new Set(assignedIds), [assignedIds]);
  const filtered = useMemo(() => {
    if (!search.trim()) return roster;
    const query = search.trim().toLowerCase();
    return roster.filter(
      (player) =>
        player.name.toLowerCase().includes(query) ||
        (player.positions || "").toLowerCase().includes(query)
    );
  }, [roster, search]);

  const isAssignMode = !!selectedSlot;

  return (
    <div className="space-y-3">
      <div
        className={`rounded-xl px-3 py-2 text-sm ${
          isAssignMode
            ? "bg-grass-700 text-white"
            : "bg-ink-950/5 text-ink-900/70 dark:bg-white/5 dark:text-chalk/70"
        }`}
      >
        {isAssignMode
          ? `Choose a player for ${slotLabel || "the selected spot"}.`
          : "Select a batting or field spot first."}
      </div>
      <input
        type="text"
        placeholder="Search name or position"
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        className="field"
        aria-label="Search roster"
      />
      <div className="flex max-h-[60vh] flex-col gap-1.5 overflow-y-auto pr-1">
        {filtered.length === 0 ? (
          <p className="px-1 py-6 text-center text-sm text-ink-900/50 dark:text-chalk/50">
            No players match that search.
          </p>
        ) : (
          filtered.map((player) => (
            <RosterItem
              key={player.id}
              player={player}
              isAssignMode={isAssignMode}
              inLineup={assigned.has(player.id)}
              onSelect={() => onSelectPlayer(player)}
            />
          ))
        )}
      </div>
    </div>
  );
}
