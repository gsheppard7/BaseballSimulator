"use client";

import { useMemo, useState } from "react";
import type { PlayerItem } from "./LineupBuilder";
import { BatBadge, PlayerAvatar } from "./PlayerAvatar";

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
    const query = search.trim().toLowerCase();
    return roster.filter(
      (player) =>
        player.name.toLowerCase().includes(query) ||
        (player.positions || "").toLowerCase().includes(query)
    );
  }, [roster, search]);

  return (
    <div className="surface p-3 shadow-card">
      <div className="mb-2 flex items-center justify-between gap-3">
        <p className="text-sm font-semibold text-ink-950 dark:text-chalk">{label}</p>
        <button
          type="button"
          onClick={onCancel}
          className="text-sm font-medium text-ink-900/60 hover:text-ink-950 dark:text-chalk/60 dark:hover:text-chalk"
        >
          Cancel
        </button>
      </div>
      <input
        type="text"
        placeholder="Search name or position"
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        className="field mb-2"
        autoFocus
      />
      <div className="max-h-52 overflow-y-auto">
        {filtered.length === 0 ? (
          <p className="py-3 text-sm text-ink-900/55 dark:text-chalk/55">No players match.</p>
        ) : (
          <ul className="space-y-1">
            {filtered.map((player) => (
              <li key={player.id}>
                <button
                  type="button"
                  onClick={() => onSelect(player)}
                  className="flex w-full items-center gap-2 rounded-xl px-2 py-1.5 text-left transition hover:bg-grass-50 dark:hover:bg-white/5"
                >
                  <PlayerAvatar name={player.name} url={player.headshotUrl} size="sm" />
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-1.5">
                      <span className="truncate text-sm font-semibold text-ink-950 dark:text-chalk">
                        {player.name}
                      </span>
                      <BatBadge side={player.batSide} />
                    </span>
                    <span className="block truncate text-xs text-ink-900/55 dark:text-chalk/55">
                      {player.positions}
                    </span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
