"use client";

import { DiamondSvg } from "./DiamondSvg";
import { lastName, PlayerAvatar } from "./PlayerAvatar";
import type { PlayerItem } from "./LineupBuilder";
import { POSITION_ORDER } from "@/lib/types";

const SPOTS: Record<string, { x: number; y: number }> = {
  CF: { x: 50, y: 16 },
  LF: { x: 18, y: 30 },
  RF: { x: 82, y: 30 },
  SS: { x: 34, y: 44 },
  "2B": { x: 66, y: 44 },
  P: { x: 50, y: 58 },
  "3B": { x: 18, y: 64 },
  "1B": { x: 82, y: 64 },
  C: { x: 50, y: 82 },
};

export function FieldView({
  positions,
  playerMap,
  selectedSlot,
  onSelectSlot,
  onClearSlot,
}: {
  positions: Record<string, string>;
  playerMap: Map<string, PlayerItem>;
  selectedSlot?: string | null;
  onSelectSlot?: (slotId: string) => void;
  onClearSlot?: (slotId: string) => void;
}) {
  return (
    <div className="relative mx-auto aspect-[10/13] w-full min-w-0 max-w-lg">
      <DiamondSvg className="absolute inset-0 h-full w-full" />
      {POSITION_ORDER.map((pos) => {
        const spot = SPOTS[pos] ?? { x: 50, y: 50 };
        const slotId = `pos-${pos}`;
        const playerId = positions[pos] ?? "";
        const player = playerId ? playerMap.get(playerId) : null;
        const selected = selectedSlot === slotId;
        return (
          <div
            key={pos}
            role="button"
            tabIndex={0}
            onClick={() => onSelectSlot?.(slotId)}
            onKeyDown={(event) => {
              if (event.target !== event.currentTarget) return;
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                onSelectSlot?.(slotId);
              }
            }}
            aria-pressed={selected}
            aria-label={player ? `${pos}, ${player.name}` : `${pos}, empty`}
            className={`absolute z-10 flex w-[22%] min-w-[3.4rem] -translate-x-1/2 -translate-y-1/2 cursor-pointer flex-col items-center rounded-xl border px-1 py-1 text-center shadow-md transition ${
              selected
                ? "z-20 border-stitch-500 bg-white ring-2 ring-stitch-500/50"
                : player
                  ? "border-white/80 bg-white/95 hover:border-chalk"
                  : "border-dashed border-white/70 bg-ink-950/35 text-white hover:bg-ink-950/55"
            }`}
            style={{ left: `${spot.x}%`, top: `${spot.y}%` }}
          >
            <span
              className={`text-[9px] font-bold uppercase tracking-[0.14em] ${
                player || selected ? "text-grass-800" : "text-white/80"
              }`}
            >
              {pos}
            </span>
            {player ? (
              <>
                <PlayerAvatar name={player.name} url={player.headshotUrl} size="xs" />
                <span className="mt-0.5 w-full truncate text-[11px] font-semibold leading-tight text-ink-950">
                  {lastName(player.name)}
                </span>
                {onClearSlot && (
                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      onClearSlot(slotId);
                    }}
                    className="text-[10px] font-medium text-ink-900/50 hover:text-stitch-600"
                  >
                    Clear
                  </button>
                )}
              </>
            ) : (
              <span className={`py-1 text-[11px] font-semibold ${selected ? "text-ink-950" : "text-white"}`}>
                Open
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}
