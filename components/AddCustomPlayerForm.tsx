"use client";

import { useState } from "react";
import { nanoid } from "nanoid";
import type { PlayerItem } from "./LineupBuilder";

export function AddCustomPlayerForm({
  onAdd,
}: {
  onAdd: (player: PlayerItem) => void;
}) {
  const [name, setName] = useState("");
  const [positions, setPositions] = useState("DH");
  const [obp, setObp] = useState("");
  const [slg, setSlg] = useState("");
  const [batSide, setBatSide] = useState("R");

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!name.trim()) return;
    onAdd({
      id: `custom-${nanoid()}`,
      name: name.trim(),
      positions: positions.trim() || "DH",
      batSide: batSide || null,
      headshotUrl: null,
      obp: obp.trim() || null,
      slg: slg.trim() || null,
    });
    setName("");
    setPositions("DH");
    setObp("");
    setSlg("");
  };

  return (
    <form onSubmit={handleSubmit} className="mt-3 space-y-2 rounded-2xl border border-ink-950/10 bg-ink-950/[0.03] p-3 dark:border-white/10 dark:bg-white/[0.04]">
      <label className="block text-xs font-semibold uppercase tracking-wider text-ink-900/50 dark:text-chalk/50">
        Name
        <input
          type="text"
          placeholder="Player name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          className="field mt-1 normal-case tracking-normal"
          required
        />
      </label>
      <div className="grid grid-cols-[1fr_auto] gap-2">
        <label className="block text-xs font-semibold uppercase tracking-wider text-ink-900/50 dark:text-chalk/50">
          Position
          <input
            type="text"
            placeholder="SS, 1B"
            value={positions}
            onChange={(event) => setPositions(event.target.value)}
            className="field mt-1 normal-case tracking-normal"
          />
        </label>
        <label className="block text-xs font-semibold uppercase tracking-wider text-ink-900/50 dark:text-chalk/50">
          Bats
          <select
            value={batSide}
            onChange={(event) => setBatSide(event.target.value)}
            className="field mt-1"
          >
            <option value="R">R</option>
            <option value="L">L</option>
            <option value="S">S</option>
          </select>
        </label>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <label className="block text-xs font-semibold uppercase tracking-wider text-ink-900/50 dark:text-chalk/50">
          OBP
          <input
            type="text"
            placeholder=".350"
            value={obp}
            onChange={(event) => setObp(event.target.value)}
            className="field mt-1 normal-case tracking-normal"
          />
        </label>
        <label className="block text-xs font-semibold uppercase tracking-wider text-ink-900/50 dark:text-chalk/50">
          SLG
          <input
            type="text"
            placeholder=".450"
            value={slg}
            onChange={(event) => setSlg(event.target.value)}
            className="field mt-1 normal-case tracking-normal"
          />
        </label>
      </div>
      <button type="submit" className="btn-primary w-full">
        Add player
      </button>
    </form>
  );
}
