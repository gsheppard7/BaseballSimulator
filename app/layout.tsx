import type { Metadata } from "next";
import { Oswald, Source_Sans_3 } from "next/font/google";
import { SiteHeader } from "@/components/SiteHeader";
import "./globals.css";

const display = Oswald({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-display",
});

const sans = Source_Sans_3({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "Lineup Simulator",
  description: "Build an MLB lineup, score it, and simulate the season.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${display.variable} ${sans.variable}`}>
      <body className="app-bg flex min-h-screen w-full max-w-[100%] flex-col overflow-x-hidden font-sans antialiased">
        <SiteHeader />
        <main className="mx-auto w-full min-w-0 max-w-7xl flex-1 px-4 py-8 sm:px-6 sm:py-10">
          {children}
        </main>
        <footer className="w-full min-w-0 border-t border-ink-950/10 py-8 text-center text-sm text-ink-900/55 dark:border-white/10 dark:text-white/45">
          Build a card, score it, and see how the season plays out.
        </footer>
      </body>
    </html>
  );
}
