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

  const selectedSlotLabel = selectedSlot
    ? selectedSlot.startsWith("bat-")
      ? `Batting #${parseInt(selectedSlot.replace("bat-", ""), 10) + 1}`
      : `Position ${selectedSlot.replace("pos-", "")}`
    : "";

  return (
    <div className="grid gap-8 lg:grid-cols-3">
      <div className="lg:col-span-2 space-y-6">
        <section>
          <h2 className="mb-3 text-lg font-semibold text-stone-900 dark:text-stone-100">
            Batting order
          </h2>
          <p className="mb-2 text-sm text-stone-500 dark:text-stone-400">
            Click a slot to select it, then click a player in the roster (or use the picker below) to assign.
          </p>
          <BattingOrderList
            battingOrder={battingOrder}
            playerMap={playerMap}
            selectedSlot={selectedSlot}
            onSelectSlot={(id) => setSelectedSlot(id as SlotId)}
            onClearSlot={clearSlot}
          />
        </section>
        <section>
          <h2 className="mb-3 text-lg font-semibold text-stone-900 dark:text-stone-100">
            Field positions
          </h2>
          <PositionGrid
            positions={positions}
            playerMap={playerMap}
            selectedSlot={selectedSlot}
            onSelectSlot={(id) => setSelectedSlot(id as SlotId)}
            onClearSlot={clearSlot}
          />
          <div className="mt-4">
            <FieldView positions={positions} playerMap={playerMap} />
          </div>
        </section>
        {selectedSlot && (
          <div className="rounded-lg border border-diamond-200 bg-diamond-50/50 p-3 dark:border-diamond-700 dark:bg-diamond-950/30">
            <PlayerPicker
              roster={effectiveRoster}
              label={`Assign player to ${selectedSlotLabel}`}
              onSelect={handleSelectPlayer}
              onCancel={() => setSelectedSlot(null)}
            />
          </div>
        )}
        {lineupId && (
          <section>
            <h2 className="mb-3 text-lg font-semibold text-stone-900 dark:text-stone-100">
              Season simulation
            </h2>
            <SimulatePanel lineupId={lineupId} />
          </section>
        )}
        {(score != null || lineupId || scoreError) && (
          <div className="rounded-lg border border-stone-200 bg-white p-4 dark:border-stone-700 dark:bg-stone-900">
            <h3 className="text-sm font-medium text-stone-700 dark:text-stone-300">
              Lineup score
            </h3>
            {scoreLoading ? (
              <p className="mt-1 text-stone-500 dark:text-stone-400">Loading…</p>
            ) : scoreError ? (
              <div className="mt-2 rounded border border-amber-200 bg-amber-50 p-2 text-sm text-amber-800 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-200">
                {scoreError}
              </div>
            ) : score != null ? (
              <p className="mt-1 text-lg font-semibold text-stone-900 dark:text-stone-100">
                {score.lineupScore.toFixed(1)}
                {score.runsPerGame != null && (
                  <span className="ml-2 text-base font-normal text-stone-500 dark:text-stone-400">
                    ({score.runsPerGame.toFixed(2)} runs/game)
                  </span>
                )}
              </p>
            ) : lineupId ? (
              <button
                type="button"
                onClick={fetchScore}
                className="mt-1 text-sm text-diamond-600 hover:underline dark:text-diamond-400"
              >
                Get score
              </button>
            ) : null}
          </div>
        )}
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="rounded-lg bg-diamond-600 px-4 py-2 font-medium text-white transition hover:bg-diamond-700 disabled:opacity-50 dark:bg-diamond-500 dark:hover:bg-diamond-600"
          >
            {saving ? "Saving…" : lineupId ? "Update lineup" : "Save lineup"}
          </button>
          {shareSlug && (
            <ShareBlock
              shareSlug={shareSlug}
              copySuccess={copySuccess}
              onCopy={copyShareLink}
              lineupId={lineupId}
            />
          )}
          {lineupId && (
            <button
              type="button"
              onClick={fetchScore}
              disabled={scoreLoading}
              className="rounded border border-stone-300 px-3 py-2 text-sm font-medium transition hover:bg-stone-100 dark:border-stone-600 dark:hover:bg-stone-800"
            >
              Refresh score
            </button>
          )}
        </div>
      </div>
      <div>
        <h2 className="mb-3 text-lg font-semibold text-stone-900 dark:text-stone-100">
          Roster
        </h2>
        <RosterList
          roster={effectiveRoster}
          selectedSlot={selectedSlot}
          onSelectPlayer={handleSelectPlayer}
        />
        <div className="mt-3">
          <button
            type="button"
            onClick={() => setShowAddCustom(!showAddCustom)}
            className="text-sm text-diamond-600 hover:underline dark:text-diamond-400"
          >
            {showAddCustom ? "Cancel" : "+ Add custom player"}
          </button>
          {showAddCustom && (
            <AddCustomPlayerForm
              onAdd={(p) => {
                setCustomPlayers((prev) => [...prev, p]);
                setShowAddCustom(false);
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}
