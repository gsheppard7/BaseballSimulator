"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import { BattingOrderList } from "./BattingOrderList";
import { PositionGrid } from "./PositionGrid";
import { RosterList } from "./RosterList";
import { ShareBlock } from "./ShareBlock";
import { SimulatePanel } from "./SimulatePanel";
import { FieldView } from "./FieldView";
import { AddCustomPlayerForm } from "./AddCustomPlayerForm";
import { PlayerPicker } from "./PlayerPicker";
import { POSITION_ORDER } from "@/lib/types";

export interface PlayerItem {
  id: string;
  name: string;
  positions: string;
  batSide: string | null;
  headshotUrl: string | null;
  obp: string | null;
  slg: string | null;
}

type SlotId = `bat-${number}` | `pos-${string}`;

export function LineupBuilder({
  roster,
  teamId,
  initialBattingOrder = [],
  initialPositions = {},
  lineupId: initialLineupId,
  shareSlug: initialShareSlug,
}: {
  roster: PlayerItem[];
  teamId: string;
  initialBattingOrder?: string[];
  initialPositions?: Record<string, string>;
  lineupId?: string | null;
  shareSlug?: string | null;
}) {
  const [battingOrder, setBattingOrder] = useState<string[]>(() =>
    initialBattingOrder.length >= 9
      ? initialBattingOrder.slice(0, 9)
      : [...initialBattingOrder, ...Array(9 - Math.max(0, initialBattingOrder.length)).fill("")]
  );
  const [positions, setPositions] = useState<Record<string, string>>(() => {
    const pos: Record<string, string> = {};
    for (const p of POSITION_ORDER) {
      pos[p] = initialPositions[p] ?? "";
    }
    return pos;
  });
  const [lineupId, setLineupId] = useState<string | null>(initialLineupId ?? null);
  const [shareSlug, setShareSlug] = useState<string | null>(initialShareSlug ?? null);
  const [saving, setSaving] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [score, setScore] = useState<{
    lineupScore: number;
    runsPerGame: number | null;
    offense?: number;
    defense?: number;
    baserunning?: number;
  } | null>(null);
  const [scoreLoading, setScoreLoading] = useState(false);
  const [scoreError, setScoreError] = useState<string | null>(null);
  const [customPlayers, setCustomPlayers] = useState<PlayerItem[]>([]);
  const [showAddCustom, setShowAddCustom] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<SlotId | null>(null);

  const effectiveRoster = useMemo(
    () => [...roster, ...customPlayers],
    [roster, customPlayers]
  );

  const setPlayerInSlot = useCallback((slot: SlotId, playerId: string | null) => {
    if (slot.startsWith("bat-")) {
      const i = parseInt(slot.replace("bat-", ""), 10);
      setBattingOrder((prev) => {
        const next = [...prev];
        next[i] = playerId ?? "";
        return next;
      });
    } else if (slot.startsWith("pos-")) {
      const pos = slot.replace("pos-", "");
      setPositions((prev) => ({ ...prev, [pos]: playerId ?? "" }));
    }
    setSelectedSlot(null);
  }, []);

  const clearSlot = useCallback((slot: SlotId) => {
    setPlayerInSlot(slot, null);
  }, [setPlayerInSlot]);

  const handleSelectPlayer = useCallback(
    (player: PlayerItem) => {
      if (selectedSlot) {
        setPlayerInSlot(selectedSlot, player.id);
      }
    },
    [selectedSlot, setPlayerInSlot]
  );

  const fetchScore = useCallback(async () => {
    if (!lineupId) return;
    setScoreLoading(true);
    setScoreError(null);
    try {
      const res = await fetch(`/api/lineups/${lineupId}/score`);
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setScore({
          lineupScore: data.lineup_score ?? data.lineupScore,
          runsPerGame: data.runs_per_game ?? data.runsPerGame ?? null,
          offense: data.offense,
          defense: data.defense,
          baserunning: data.baserunning,
        });
      } else if (data.error) {
        setScoreError(data.error);
      }
    } finally {
      setScoreLoading(false);
    }
  }, [lineupId]);

  const handleSave = useCallback(async () => {
    setSaving(true);
    try {
      const battingOrderFiltered = battingOrder.filter(Boolean);
      const positionsFiltered: Record<string, string> = {};
      for (const [pos, pid] of Object.entries(positions)) {
        if (pid) positionsFiltered[pos] = pid;
      }
      if (lineupId) {
        const res = await fetch(`/api/lineups/${lineupId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            battingOrder: battingOrderFiltered,
            positions: positionsFiltered,
          }),
        });
        if (res.ok) {
          const updated = await res.json();
          setShareSlug(updated.shareSlug ?? shareSlug);
          fetchScore();
        }
      } else {
        const res = await fetch("/api/lineups", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            teamId,
            battingOrder: battingOrderFiltered,
            positions: positionsFiltered,
          }),
        });
        if (!res.ok) throw new Error("Save failed");
        const data = await res.json();
        setLineupId(data.id);
        setShareSlug(data.shareSlug);
      }
    } finally {
      setSaving(false);
    }
  }, [battingOrder, positions, teamId, lineupId, shareSlug, fetchScore]);

  const copyShareLink = useCallback(() => {
    if (!shareSlug) return;
    const url = `${typeof window !== "undefined" ? window.location.origin : ""}/lineup/${shareSlug}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    });
  }, [shareSlug]);

  useEffect(() => {
    if (lineupId) fetchScore();
  }, [lineupId, fetchScore]);

  const playerMap = new Map(effectiveRoster.map((p) => [p.id, p]));
  const battersFilled = battingOrder.filter(Boolean).length;
  const positionsFilled = Object.values(positions).filter(Boolean).length;
  const assignedIds = [...battingOrder, ...Object.values(positions)].filter(Boolean);

  const selectedSlotLabel = selectedSlot
    ? selectedSlot.startsWith("bat-")
      ? `batting #${parseInt(selectedSlot.replace("bat-", ""), 10) + 1}`
      : selectedSlot.replace("pos-", "")
    : "";

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-3xl bg-ink-950 text-chalk shadow-card">
        <div className="flex flex-wrap items-end justify-between gap-4 px-5 py-5 sm:px-6">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/55">
              Lineup score
            </p>
            {scoreLoading ? (
              <p className="mt-2 font-display text-5xl leading-none">Scoring</p>
            ) : score != null ? (
              <div className="mt-2 flex flex-wrap items-end gap-x-4 gap-y-1">
                <p className="font-display text-6xl leading-none tabular-nums">
                  {score.lineupScore.toFixed(1)}
                </p>
                {score.runsPerGame != null && (
                  <p className="pb-1 text-sm text-white/70">
                    {score.runsPerGame.toFixed(2)} runs / game
                  </p>
                )}
              </div>
            ) : (
              <p className="mt-2 max-w-md text-sm leading-relaxed text-white/70">
                Save the card to score it, then run a thousand seasons.
              </p>
            )}
            {score != null &&
              score.offense != null &&
              score.defense != null &&
              score.baserunning != null && (
                <p className="mt-3 text-xs uppercase tracking-[0.16em] text-white/55">
                  Off {score.offense.toFixed(1)}
                  <span className="mx-2 text-white/25">·</span>
                  Def {score.defense.toFixed(1)}
                  <span className="mx-2 text-white/25">·</span>
                  Run {score.baserunning.toFixed(1)}
                </p>
              )}
            {scoreError && (
              <p className="mt-3 max-w-xl text-sm text-amber-200">{scoreError}</p>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={handleSave} disabled={saving} className="btn-primary">
              {saving ? "Saving…" : lineupId ? "Update lineup" : "Save lineup"}
            </button>
            {lineupId && (
              <button
                type="button"
                onClick={fetchScore}
                disabled={scoreLoading}
                className="btn-ghost-light"
              >
                Refresh score
              </button>
            )}
          </div>
        </div>
        {shareSlug && (
          <div className="border-t border-white/10 bg-white px-5 py-4 text-ink-950 dark:bg-ink-900 dark:text-chalk sm:px-6">
            <ShareBlock
              shareSlug={shareSlug}
              copySuccess={copySuccess}
              onCopy={copyShareLink}
              lineupId={lineupId}
            />
          </div>
        )}
      </section>

      <div className={`grid min-w-0 items-start gap-6 xl:grid-cols-[minmax(0,1fr)_22rem] ${selectedSlot ? "pb-72 xl:pb-0" : ""}`}>
        <div className="min-w-0 space-y-6">
          <section className="surface p-4 sm:p-5">
            <div className="mb-4 flex items-end justify-between gap-3">
              <div>
                <h2 className="section-title">Batting order</h2>
                <p className="mt-1 text-sm text-ink-900/60 dark:text-chalk/60">
                  Click a spot, then pick a player from the roster.
                </p>
              </div>
              <p className="font-display text-2xl tabular-nums text-grass-700 dark:text-grass-400">
                {battersFilled}/9
              </p>
            </div>
            <BattingOrderList
              battingOrder={battingOrder}
              positions={positions}
              playerMap={playerMap}
              selectedSlot={selectedSlot}
              onSelectSlot={(id) => setSelectedSlot(id as SlotId)}
              onClearSlot={(id) => clearSlot(id as SlotId)}
            />
          </section>

          <section className="surface p-4 sm:p-5">
            <div className="mb-4 flex items-end justify-between gap-3">
              <div>
                <h2 className="section-title">Defense</h2>
                <p className="mt-1 text-sm text-ink-900/60 dark:text-chalk/60">
                  Place the nine, including the pitcher.
                </p>
              </div>
              <p className="font-display text-2xl tabular-nums text-grass-700 dark:text-grass-400">
                {positionsFilled}/9
              </p>
            </div>
            <FieldView
              positions={positions}
              playerMap={playerMap}
              selectedSlot={selectedSlot}
              onSelectSlot={(id) => setSelectedSlot(id as SlotId)}
              onClearSlot={(id) => clearSlot(id as SlotId)}
            />
            <div className="mt-4">
              <PositionGrid
                positions={positions}
                playerMap={playerMap}
                selectedSlot={selectedSlot}
                onSelectSlot={(id) => setSelectedSlot(id as SlotId)}
                onClearSlot={(id) => clearSlot(id as SlotId)}
              />
            </div>
          </section>

          {lineupId && <SimulatePanel lineupId={lineupId} />}
        </div>

        <aside className="surface p-4 xl:sticky xl:top-20">
          <h2 className="section-title">Roster</h2>
          <div className="mt-4">
            <RosterList
              roster={effectiveRoster}
              selectedSlot={selectedSlot}
              slotLabel={selectedSlotLabel}
              assignedIds={assignedIds}
              onSelectPlayer={handleSelectPlayer}
            />
          </div>
          <div className="mt-3 border-t border-ink-950/10 pt-3 dark:border-white/10">
            <button
              type="button"
              onClick={() => setShowAddCustom((open) => !open)}
              className="text-sm font-semibold text-grass-800 hover:underline dark:text-grass-400"
            >
              {showAddCustom ? "Cancel" : "Add a custom player"}
            </button>
            {showAddCustom && (
              <AddCustomPlayerForm
                onAdd={(player) => {
                  setCustomPlayers((prev) => [...prev, player]);
                  setShowAddCustom(false);
                }}
              />
            )}
          </div>
        </aside>
      </div>

      {selectedSlot && (
        <div className="fixed inset-x-0 bottom-0 z-30 border-t border-ink-950/10 bg-chalk/95 p-3 shadow-card backdrop-blur xl:hidden dark:border-white/10 dark:bg-ink-950/95">
          <PlayerPicker
            roster={effectiveRoster}
            label={`Assign ${selectedSlotLabel}`}
            onSelect={handleSelectPlayer}
            onCancel={() => setSelectedSlot(null)}
          />
        </div>
      )}
    </div>
  );
}
