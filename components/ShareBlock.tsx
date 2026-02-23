"use client";

import { useState } from "react";

export function ShareBlock({
  shareSlug,
  copySuccess,
  onCopy,
  lineupId,
  onSubmittedToLeaderboard,
}: {
  shareSlug: string;
  copySuccess: boolean;
  onCopy: () => void;
  lineupId?: string | null;
  onSubmittedToLeaderboard?: () => void;
}) {
  const [showLeaderboardForm, setShowLeaderboardForm] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [tags, setTags] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const submitToLeaderboard = async () => {
    if (!lineupId) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/lineups/${lineupId}/leaderboard`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          displayName: displayName.trim() || "Anonymous",
          constraintTags: tags
            .split(/[\s,]+/)
            .map((t) => t.trim())
            .filter(Boolean),
        }),
      });
      if (res.ok) {
        setSubmitted(true);
        onSubmittedToLeaderboard?.();
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-lg border border-stone-200 bg-stone-50 px-3 py-2 dark:border-stone-700 dark:bg-stone-900/50">
      <span className="text-sm text-stone-600 dark:text-stone-400">
        Share:
      </span>
      <code className="rounded bg-stone-200 px-2 py-1 text-xs dark:bg-stone-700">
        /lineup/{shareSlug}
      </code>
      <button
        type="button"
        onClick={onCopy}
        className="rounded bg-stone-200 px-2 py-1 text-xs font-medium transition hover:bg-stone-300 dark:bg-stone-600 dark:hover:bg-stone-500"
      >
        {copySuccess ? "Copied!" : "Copy link"}
      </button>
      {lineupId && !submitted && (
        <button
          type="button"
          onClick={() => setShowLeaderboardForm(!showLeaderboardForm)}
          className="rounded bg-diamond-100 px-2 py-1 text-xs font-medium text-diamond-800 transition hover:bg-diamond-200 dark:bg-diamond-900/50 dark:text-diamond-200 dark:hover:bg-diamond-800/50"
        >
          Submit to leaderboard
        </button>
      )}
      {submitted && (
        <span className="text-xs text-diamond-600 dark:text-diamond-400">
          Submitted to leaderboard
        </span>
      )}
      {showLeaderboardForm && lineupId && (
        <div className="mt-2 flex w-full flex-wrap items-end gap-2">
          <input
            type="text"
            placeholder="Display name"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="w-36 rounded border border-stone-300 px-2 py-1 text-xs dark:border-stone-600 dark:bg-stone-800 dark:text-stone-100"
          />
          <input
            type="text"
            placeholder="Tags (e.g. rookies, lefties)"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            className="w-40 rounded border border-stone-300 px-2 py-1 text-xs dark:border-stone-600 dark:bg-stone-800 dark:text-stone-100"
          />
          <button
            type="button"
            onClick={submitToLeaderboard}
            disabled={submitting}
            className="rounded bg-diamond-600 px-2 py-1 text-xs font-medium text-white hover:bg-diamond-700 disabled:opacity-50 dark:bg-diamond-500 dark:hover:bg-diamond-600"
          >
            {submitting ? "Submitting…" : "Submit"}
          </button>
        </div>
      )}
    </div>
  );
}
