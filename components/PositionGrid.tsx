"use client";

import type { PlayerItem } from "./LineupBuilder";
import { lastName } from "./PlayerAvatar";
import { POSITION_ORDER } from "@/lib/types";

function PositionSlot({
  position,
  playerId,
  playerMap,
  isSelected,
  onSelect,
  onClear,
}: {
  position: string;
  playerId: string | null;
  playerMap: Map<string, PlayerItem>;
  isSelected: boolean;
  onSelect: () => void;
  onClear: (e: React.MouseEvent) => void;
}) {
  const player = playerId ? playerMap.get(playerId) : null;
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={(event) => {
        if (event.target !== event.currentTarget) return;
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onSelect();
        }
      }}
      aria-pressed={isSelected}
      className={`cursor-pointer rounded-xl border px-2 py-2 text-left transition ${
        isSelected
          ? "border-stitch-500 bg-stitch-500/10"
          : "border-ink-950/10 bg-white hover:border-ink-950/25 dark:border-white/10 dark:bg-ink-950/40 dark:hover:border-white/25"
      }`}
    >
      <span className="block text-[10px] font-bold uppercase tracking-[0.14em] text-ink-900/50 dark:text-chalk/50">
        {position}
      </span>
      <span className="mt-0.5 block truncate text-sm font-semibold text-ink-950 dark:text-chalk">
        {player ? lastName(player.name) : "Open"}
      </span>
      {player && (
        <button
          type="button"
          onClick={onClear}
          className="text-[11px] text-ink-900/50 hover:text-stitch-600 dark:text-chalk/50"
        >
          Clear
        </button>
      )}
    </div>
  );
}

export function PositionGrid({
  positions,
  playerMap,
  selectedSlot,
  onSelectSlot,
  onClearSlot,
}: {
  positions: Record<string, string>;
  playerMap: Map<string, PlayerItem>;
  selectedSlot: string | null;
  onSelectSlot: (slotId: string) => void;
  onClearSlot: (slotId: string) => void;
}) {
  return (
    <div className="grid grid-cols-3 gap-2 sm:grid-cols-5 lg:grid-cols-9">
      {POSITION_ORDER.map((pos) => (
        <PositionSlot
          key={pos}
          position={pos}
          playerId={positions[pos] ?? null}
          playerMap={playerMap}
          isSelected={selectedSlot === `pos-${pos}`}
          onSelect={() => onSelectSlot(`pos-${pos}`)}
          onClear={(event) => {
            event.stopPropagation();
            onClearSlot(`pos-${pos}`);
          }}
        />
      ))}
    </div>
  );
}
