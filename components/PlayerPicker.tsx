"use client";

import { useState, useMemo } from "react";
import type { PlayerItem } from "./LineupBuilder";

export function PlayerPicker({
  roster,
  onSelect,
  onCancel,
  label,
}: {
  roster: PlayerItem[];
  onSelect: (player: PlayerItem) => void;
  onCancel: () => void;
  label: string;
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

  return (
    <div className="rounded-lg border border-diamond-200 bg-white p-3 shadow-lg dark:border-diamond-700 dark:bg-stone-900">
      <p className="mb-2 text-sm font-medium text-stone-700 dark:text-stone-300">
        {label}
      </p>
      <input
        type="text"
        placeholder="Type to search by name or position…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="mb-2 w-full rounded border border-stone-300 px-3 py-2 text-sm dark:border-stone-600 dark:bg-stone-800 dark:text-stone-100"
        autoFocus
      />
      <div className="max-h-48 overflow-y-auto">
        {filtered.length === 0 ? (
          <p className="py-2 text-sm text-stone-500 dark:text-stone-400">
            No players match.
          </p>
        ) : (
          <ul className="space-y-1">
            {filtered.map((player) => (
              <li key={player.id}>
                <button
                  type="button"
                  onClick={() => onSelect(player)}
                  className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-left text-sm transition hover:bg-diamond-100 dark:hover:bg-diamond-900/40"
                >
                  <span className="font-medium text-stone-900 dark:text-stone-100">
                    {player.name}
                  </span>
                  <span className="text-stone-500 dark:text-stone-400">
                    {player.positions}
                    {player.batSide ? ` · ${player.batSide}` : ""}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
      <button
        type="button"
        onClick={onCancel}
        className="mt-2 text-sm text-stone-500 hover:underline dark:text-stone-400"
      >
        Cancel
      </button>
    </div>
  );
}
