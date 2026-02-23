import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Baseball Lineup Simulator",
  description: "Build and simulate MLB lineups",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-stone-50 text-stone-900 antialiased dark:bg-stone-950 dark:text-stone-100">
        <header className="border-b border-stone-200 bg-white/80 dark:border-stone-800 dark:bg-stone-900/80">
          <div className="mx-auto flex h-14 max-w-6xl items-center px-4">
            <a href="/" className="text-lg font-semibold text-diamond-700 dark:text-diamond-400">
              Lineup Simulator
            </a>
            <nav className="ml-8 flex gap-6">
              <a href="/leaderboard" className="text-sm text-stone-600 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-100">
                Leaderboard
              </a>
              <a href="/compare" className="text-sm text-stone-600 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-100">
                Compare
              </a>
            </nav>
          </div>
        </header>
        <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
      </body>
    </html>
  );
}
