"use client";

import { useState } from "react";

const SIZES = {
  xs: "h-6 w-6 text-[10px]",
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-12 w-12 text-base",
} as const;

export function initials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function lastName(name: string): string {
  return name.split(" ").filter(Boolean).pop() ?? name;
}

export function PlayerAvatar({
  name,
  url,
  size = "md",
}: {
  name: string;
  url?: string | null;
  size?: keyof typeof SIZES;
}) {
  const [failed, setFailed] = useState(false);
  const className = `${SIZES[size]} shrink-0 overflow-hidden rounded-full bg-ink-950 text-chalk ring-1 ring-black/10 dark:bg-chalk dark:text-ink-950`;

  if (url && !failed) {
    return (
      // MLB headshots are already resized; a plain img avoids remote image config.
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={url}
        alt=""
        onError={() => setFailed(true)}
        className={`${className} object-cover object-top`}
      />
    );
  }

  return (
    <span className={`inline-flex items-center justify-center font-semibold ${className}`}>
      {initials(name) || "?"}
    </span>
  );
}

export function BatBadge({ side }: { side: string | null | undefined }) {
  if (!side) return null;
  const tone =
    side === "L"
      ? "bg-sky-100 text-sky-900 dark:bg-sky-950 dark:text-sky-200"
      : side === "S"
        ? "bg-amber-100 text-amber-950 dark:bg-amber-950 dark:text-amber-200"
        : "bg-rose-100 text-rose-900 dark:bg-rose-950 dark:text-rose-200";
  return (
    <span className={`rounded px-1.5 py-0.5 text-[10px] font-bold leading-none ${tone}`}>
      {side}
    </span>
  );
}
