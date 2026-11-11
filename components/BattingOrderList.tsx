"use client";

import type { PlayerItem } from "./LineupBuilder";
import { BatBadge, PlayerAvatar } from "./PlayerAvatar";

function Slot({
  index,
  playerId,
  playerMap,
  fieldPosition,
  isSelected,
  onSelect,
  onClear,
}: {
  index: number;
  playerId: string | null;
  playerMap: Map<string, PlayerItem>;
  fieldPosition: string | null;
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
      className={`flex cursor-pointer items-center gap-3 rounded-2xl border px-3 py-2.5 transition ${
        isSelected
          ? "border-stitch-500 bg-stitch-500/10 shadow-sm"
          : "border-ink-950/10 bg-white hover:border-ink-950/25 dark:border-white/10 dark:bg-ink-950/40 dark:hover:border-white/25"
      }`}
    >
      <span
        className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg font-display text-xl leading-none ${
          player
            ? "bg-ink-950 text-chalk dark:bg-chalk dark:text-ink-950"
            : "bg-ink-950/5 text-ink-900/40 dark:bg-white/10 dark:text-chalk/40"
        }`}
      >
        {index + 1}
      </span>
      {player ? (
        <>
          <PlayerAvatar name={player.name} url={player.headshotUrl} size="md" />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <p className="truncate font-semibold text-ink-950 dark:text-chalk">{player.name}</p>
              <BatBadge side={player.batSide} />
            </div>
            <p className="truncate text-xs tabular-nums text-ink-900/55 dark:text-chalk/55">
              {[
                fieldPosition &&
                !player.positions.split(/[,\s]+/).includes(fieldPosition)
                  ? fieldPosition
                  : null,
                player.positions,
                player.obp || player.slg ? `${player.obp ?? "—"} / ${player.slg ?? "—"}` : null,
              ]
                .filter(Boolean)
                .join(" · ")}
            </p>
          </div>
          <button
            type="button"
            onClick={onClear}
            className="rounded-full px-2 py-1 text-xs font-medium text-ink-900/50 hover:bg-ink-950/5 hover:text-stitch-600 dark:text-chalk/50 dark:hover:bg-white/10"
            aria-label={`Clear batting slot ${index + 1}`}
          >
            Clear
          </button>
        </>
      ) : (
        <span className="text-sm text-ink-900/45 dark:text-chalk/45">Open spot</span>
      )}
    </div>
  );
}

export function BattingOrderList({
  battingOrder,
  positions,
  playerMap,
  selectedSlot,
  onSelectSlot,
  onClearSlot,
}: {
  battingOrder: string[];
  positions: Record<string, string>;
  playerMap: Map<string, PlayerItem>;
  selectedSlot: string | null;
  onSelectSlot: (slotId: string) => void;
  onClearSlot: (slotId: string) => void;
}) {
  const fieldByPlayer = new Map<string, string>();
  for (const [position, playerId] of Object.entries(positions)) {
    if (playerId && !fieldByPlayer.has(playerId)) fieldByPlayer.set(playerId, position);
  }
  const order = Array.from({ length: 9 }, (_, i) => battingOrder[i] ?? null);

  return (
    <div className="space-y-2">
      {order.map((playerId, index) => (
        <Slot
          key={`bat-${index}`}
          index={index}
          playerId={playerId}
          playerMap={playerMap}
          fieldPosition={playerId ? fieldByPlayer.get(playerId) ?? null : null}
          isSelected={selectedSlot === `bat-${index}`}
          onSelect={() => onSelectSlot(`bat-${index}`)}
          onClear={(event) => {
            event.stopPropagation();
            onClearSlot(`bat-${index}`);
          }}
        />
      ))}
    </div>
  );
}
