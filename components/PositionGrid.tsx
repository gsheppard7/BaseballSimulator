"use client";

import type { PlayerItem } from "./LineupBuilder";
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
      onKeyDown={(e) => e.key === "Enter" && onSelect()}
      className={`flex flex-col items-center justify-center rounded-lg border-2 p-2 transition ${
        isSelected
          ? "border-diamond-500 bg-diamond-50 dark:border-diamond-400 dark:bg-diamond-950/50"
          : "border-stone-200 bg-white hover:border-stone-300 dark:border-stone-700 dark:bg-stone-900 dark:hover:border-stone-600"
      } cursor-pointer`}
    >
      <span className="text-xs font-medium text-stone-500 dark:text-stone-400">
        {position}
      </span>
      {player ? (
        <>
          <span className="mt-1 truncate text-center text-sm font-medium text-stone-900 dark:text-stone-100">
            {player.name.split(" ").pop() ?? player.name}
          </span>
          <button
            type="button"
            onClick={onClear}
            className="mt-0.5 text-xs text-stone-500 hover:underline dark:text-stone-400"
            aria-label={`Clear ${position}`}
          >
            Clear
          </button>
        </>
      ) : (
        <span className="mt-1 text-xs text-stone-400 dark:text-stone-500">
          Click to add
        </span>
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
    <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
      {POSITION_ORDER.filter((p) => p !== "P").map((pos) => (
        <PositionSlot
          key={pos}
          position={pos}
          playerId={positions[pos] ?? null}
          playerMap={playerMap}
          isSelected={selectedSlot === `pos-${pos}`}
          onSelect={() => onSelectSlot(`pos-${pos}`)}
          onClear={(e) => {
            e.stopPropagation();
            onClearSlot(`pos-${pos}`);
          }}
        />
      ))}
    </div>
  );
}
