"use client";

import { useState, useMemo } from "react";
import type { PlayerItem } from "./LineupBuilder";


function RosterItem({
  player,
  isAssignMode,
  onSelect,
}: {
  player: PlayerItem;
  isAssignMode: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={isAssignMode ? onSelect : undefined}
      className={`flex w-full items-center gap-2 rounded-lg border bg-white p-2 text-left transition dark:bg-stone-900 ${
        isAssignMode
          ? "cursor-pointer border-diamond-300 hover:border-diamond-500 hover:bg-diamond-50 dark:border-diamond-700 dark:hover:border-diamond-600 dark:hover:bg-diamond-950/40"
          : "border-stone-200 dark:border-stone-700"
      }`}
    >
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-stone-200 text-xs font-medium text-stone-700 dark:bg-stone-600 dark:text-stone-200">
        {player.name
          .split(" ")
          .map((n) => n[0])
          .join("")
          .slice(0, 2)}
      </div>
      <div className="min-w-0">
        <p className="truncate text-sm font-medium text-stone-900 dark:text-stone-100">
          {player.name}
        </p>
        <p className="text-xs text-stone-500 dark:text-stone-400">
          {player.positions}
          {player.batSide ? ` · ${player.batSide}` : ""}
        </p>
      </div>
    </button>
  );
}

export function RosterList({
  roster,
  selectedSlot,
  onSelectPlayer,
}: {
  roster: PlayerItem[];
  selectedSlot: string | null;
  onSelectPlayer: (player: PlayerItem) => void;
}) {
  const [search, setSearch] = useState("");
  const filtered = useMemo(() => {
    if (!search.trim()) return roster;
    const q = search.trim().toLowerCase();
    return roster.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        (p.positions || "").toLowerCase().includes(q)
    );
  }, [roster, search]);

  const isAssignMode = !!selectedSlot;

  return (
    <div className="space-y-2">
      {isAssignMode && (
        <p className="text-xs text-diamond-600 dark:text-diamond-400">
          Click a player to assign to the selected slot
        </p>
      )}
      <input
        type="text"
        placeholder="Search by name or position…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full rounded border border-stone-300 px-2 py-1.5 text-sm dark:border-stone-600 dark:bg-stone-800 dark:text-stone-100"
        aria-label="Search roster"
      />
      <div className="flex max-h-[60vh] flex-col gap-1 overflow-y-auto rounded-lg border border-stone-200 bg-stone-50/50 p-2 dark:border-stone-700 dark:bg-stone-900/50">
        {filtered.map((player) => (
          <RosterItem
            key={player.id}
            player={player}
            isAssignMode={isAssignMode}
            onSelect={() => onSelectPlayer(player)}
          />
        ))}
      </div>
    </div>
  );
}
