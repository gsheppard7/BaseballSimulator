"use client";

import type { PlayerItem } from "./LineupBuilder";

/**
 * 2D diamond-style field with position slots and player initials/headshots.
 */
export function FieldView({
  positions,
  playerMap,
}: {
  positions: Record<string, string>;
  playerMap: Map<string, PlayerItem>;
}) {
  const order = ["P", "C", "1B", "2B", "3B", "SS", "LF", "CF", "RF"];
  return (
    <div className="relative aspect-[2/1] max-w-lg rounded-lg border border-stone-200 bg-diamond-50/30 dark:border-stone-700 dark:bg-diamond-950/20">
      {/* Simplified diamond: infield arc + outfield */}
      <div className="absolute inset-0 flex flex-wrap items-center justify-center gap-2 p-4">
        {order.map((pos) => {
          const playerId = positions[pos] ?? "";
          const player = playerId ? playerMap.get(playerId) : null;
          const label = player
            ? player.name
                .split(" ")
                .map((n) => n[0])
                .join("")
                .slice(0, 2)
            : pos;
          return (
            <div
              key={pos}
              className="flex flex-col items-center rounded-lg border border-stone-200 bg-white/90 px-2 py-1.5 shadow-sm dark:border-stone-600 dark:bg-stone-800/90"
              style={{
                position: "absolute",
                ...positionStyle(pos),
              }}
            >
              <span className="text-[10px] font-medium text-stone-500 dark:text-stone-400">
                {pos}
              </span>
              <span className="text-xs font-semibold text-stone-900 dark:text-stone-100">
                {label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function positionStyle(pos: string): React.CSSProperties {
  const percent = (x: number, y: number) => ({
    left: `${x}%`,
    top: `${y}%`,
    transform: "translate(-50%, -50%)",
  });
  const map: Record<string, React.CSSProperties> = {
    P: percent(50, 35),
    C: percent(50, 42),
    "1B": percent(72, 28),
    "2B": percent(58, 38),
    "3B": percent(28, 28),
    SS: percent(42, 38),
    LF: percent(18, 55),
    CF: percent(50, 12),
    RF: percent(82, 55),
  };
  return map[pos] ?? percent(50, 50);
}
