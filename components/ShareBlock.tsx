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
            .map((tag) => tag.trim())
            .filter(Boolean),
        }),
      });
      if (res.ok) {
        setSubmitted(true);
        setShowLeaderboardForm(false);
        onSubmittedToLeaderboard?.();
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-semibold uppercase tracking-[0.16em] text-ink-900/50 dark:text-chalk/50">
          Share
        </span>
        <code className="rounded-lg bg-ink-950/5 px-2 py-1 text-xs text-ink-900 dark:bg-white/10 dark:text-chalk">
          /lineup/{shareSlug}
        </code>
        <button type="button" onClick={onCopy} className="btn-secondary px-3 py-1 text-xs">
          {copySuccess ? "Copied" : "Copy link"}
        </button>
        {lineupId && !submitted && (
          <button
            type="button"
            onClick={() => setShowLeaderboardForm((open) => !open)}
            className="btn-secondary px-3 py-1 text-xs"
          >
            Submit to leaderboard
          </button>
        )}
        {submitted && (
          <span className="text-xs font-semibold text-grass-700 dark:text-grass-400">
            On the leaderboard
          </span>
        )}
      </div>
      {showLeaderboardForm && lineupId && (
        <div className="grid gap-2 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
          <label className="block text-xs font-medium text-ink-900/60 dark:text-chalk/60">
            Display name
            <input
              type="text"
              placeholder="Your name"
              value={displayName}
              onChange={(event) => setDisplayName(event.target.value)}
              className="field mt-1"
            />
          </label>
          <label className="block text-xs font-medium text-ink-900/60 dark:text-chalk/60">
            Tags
            <input
              type="text"
              placeholder="rookies, lefties"
              value={tags}
              onChange={(event) => setTags(event.target.value)}
              className="field mt-1"
            />
          </label>
          <button
            type="button"
            onClick={submitToLeaderboard}
            disabled={submitting}
            className="btn-primary"
          >
            {submitting ? "Submitting…" : "Submit"}
          </button>
        </div>
      )}
    </div>
  );
}
