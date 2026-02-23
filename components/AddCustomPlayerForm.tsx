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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
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
    <form
      onSubmit={handleSubmit}
      className="mt-2 rounded-lg border border-stone-200 bg-white p-3 dark:border-stone-700 dark:bg-stone-900"
    >
      <input
        type="text"
        placeholder="Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="mb-2 w-full rounded border border-stone-300 px-2 py-1.5 text-sm dark:border-stone-600 dark:bg-stone-800 dark:text-stone-100"
        required
      />
      <div className="mb-2 flex gap-2">
        <input
          type="text"
          placeholder="Pos (e.g. SS, 1B)"
          value={positions}
          onChange={(e) => setPositions(e.target.value)}
          className="w-24 rounded border border-stone-300 px-2 py-1.5 text-sm dark:border-stone-600 dark:bg-stone-800 dark:text-stone-100"
        />
        <select
          value={batSide}
          onChange={(e) => setBatSide(e.target.value)}
          className="rounded border border-stone-300 px-2 py-1.5 text-sm dark:border-stone-600 dark:bg-stone-800 dark:text-stone-100"
        >
          <option value="R">R</option>
          <option value="L">L</option>
          <option value="S">S</option>
        </select>
      </div>
      <div className="mb-2 flex gap-2">
        <input
          type="text"
          placeholder="OBP (e.g. .350)"
          value={obp}
          onChange={(e) => setObp(e.target.value)}
          className="w-20 rounded border border-stone-300 px-2 py-1.5 text-sm dark:border-stone-600 dark:bg-stone-800 dark:text-stone-100"
        />
        <input
          type="text"
          placeholder="SLG (e.g. .450)"
          value={slg}
          onChange={(e) => setSlg(e.target.value)}
          className="w-20 rounded border border-stone-300 px-2 py-1.5 text-sm dark:border-stone-600 dark:bg-stone-800 dark:text-stone-100"
        />
      </div>
      <button
        type="submit"
        className="rounded bg-diamond-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-diamond-700 dark:bg-diamond-500 dark:hover:bg-diamond-600"
      >
        Add player
      </button>
    </form>
  );
}
