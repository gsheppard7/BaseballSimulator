"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/team/select", label: "Teams", match: "/team" },
  { href: "/leaderboard", label: "Leaderboard", match: "/leaderboard" },
  { href: "/compare", label: "Compare", match: "/compare" },
];

function linkClass(active: boolean): string {
  const base = "rounded-full px-2 py-1 text-xs sm:px-3 sm:py-1.5 sm:text-sm";
  return active
    ? `${base} bg-ink-950 font-semibold text-chalk dark:bg-chalk dark:text-ink-950`
    : `${base} font-medium text-ink-900/70 transition hover:bg-ink-950/5 dark:text-chalk/70 dark:hover:bg-white/10`;
}

export function SiteHeader() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 w-full min-w-0 border-b border-ink-950/10 bg-chalk/80 backdrop-blur-md dark:border-white/10 dark:bg-ink-950/80">
      <div className="mx-auto flex h-16 w-full min-w-0 max-w-7xl items-center justify-between gap-2 px-3 sm:px-6">
        <Link href="/" className="flex min-w-0 items-center gap-2">
          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-grass-700 text-chalk shadow-sm sm:h-9 sm:w-9 sm:rounded-xl">
            <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden>
              <path
                d="M12 19.5 19.5 12 12 4.5 4.5 12 12 19.5Z"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
              />
              <circle cx="12" cy="13.2" r="1.15" fill="currentColor" />
            </svg>
          </span>
          <span className="truncate font-display text-lg tracking-[0.08em] text-ink-950 dark:text-chalk sm:text-xl sm:tracking-[0.14em]">
            LINEUP
          </span>
        </Link>
        <nav className="flex shrink-0 items-center gap-0.5 sm:gap-1">
          {LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={linkClass(pathname === link.href || pathname.startsWith(`${link.match}/`) || pathname === link.match)}
            >
              <span className="sm:hidden">{link.label === "Leaderboard" ? "Board" : link.label}</span>
              <span className="hidden sm:inline">{link.label}</span>
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
