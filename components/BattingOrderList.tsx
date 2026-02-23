"use client";

import type { PlayerItem } from "./LineupBuilder";

function Slot({
  index,
  playerId,
  playerMap,
  isSelected,
  onSelect,
  onClear,
}: {
  index: number;
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
      className={`flex cursor-pointer items-center gap-3 rounded-lg border-2 p-3 transition ${
        isSelected
          ? "border-diamond-500 bg-diamond-50 dark:border-diamond-400 dark:bg-diamond-950/50"
          : "border-stone-200 bg-white hover:border-stone-300 dark:border-stone-700 dark:bg-stone-900 dark:hover:border-stone-600"
      }`}
    >
      <span className="w-6 shrink-0 text-sm font-medium text-stone-500 dark:text-stone-400">
        {index + 1}
      </span>
      {player ? (
        <>
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-stone-200 text-sm font-medium text-stone-700 dark:bg-stone-600 dark:text-stone-200">
            {player.name
              .split(" ")
              .map((n) => n[0])
              .join("")
              .slice(0, 2)}
          </div>
          <span className="font-medium text-stone-900 dark:text-stone-100">
            {player.name}
          </span>
          <span className="text-sm text-stone-500 dark:text-stone-400">
            {player.positions}
            {player.batSide ? ` · ${player.batSide}` : ""}
          </span>
          <button
            type="button"
            onClick={onClear}
            className="ml-auto rounded px-2 py-0.5 text-xs text-stone-500 hover:bg-stone-200 hover:text-stone-800 dark:hover:bg-stone-600 dark:hover:text-stone-200"
            aria-label="Clear slot"
          >
            Clear
          </button>
        </>
      ) : (
        <span className="text-stone-400 dark:text-stone-500">
          Click to add batter
        </span>
      )}
    </div>
  );
}

export function BattingOrderList({
  battingOrder,
  playerMap,
  selectedSlot,
  onSelectSlot,
  onClearSlot,
}: {
  battingOrder: string[];
  playerMap: Map<string, PlayerItem>;
  selectedSlot: string | null;
  onSelectSlot: (slotId: string) => void;
  onClearSlot: (slotId: string) => void;
}) {
  const order = Array.from({ length: 9 }, (_, i) => battingOrder[i] ?? null);
  return (
    <div className="space-y-2">
      {order.map((playerId, i) => (
        <Slot
          key={`bat-${i}`}
          index={i}
          playerId={playerId}
          playerMap={playerMap}
          isSelected={selectedSlot === `bat-${i}`}
          onSelect={() => onSelectSlot(`bat-${i}`)}
          onClear={(e) => {
            e.stopPropagation();
            onClearSlot(`bat-${i}`);
          }}
        />
      ))}
    </div>
  );
}
