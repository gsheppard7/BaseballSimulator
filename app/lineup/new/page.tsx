import { redirect } from "next/navigation";
import { LineupBuilder } from "@/components/LineupBuilder";

export const dynamic = "force-dynamic";

async function getRoster(teamId: string) {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const res = await fetch(`${base}/api/teams/${teamId}/roster`, {
    cache: "no-store",
  });
  if (!res.ok) return null;
  return res.json();
}

export default async function NewLineupPage({
  searchParams,
}: {
  searchParams: Promise<{ team?: string }>;
}) {
  const { team: teamId } = await searchParams;
  if (!teamId) redirect("/team/select");
  const roster = await getRoster(teamId);
  if (!roster || roster.length === 0) redirect(`/team/${teamId}`);

  const playerItems = roster.map(
    (p: {
      id: string;
      name: string;
      positions: string;
      batSide: string | null;
      headshotUrl: string | null;
      obp: string | null;
      slg: string | null;
    }) => ({
      id: p.id,
      name: p.name,
      positions: p.positions,
      batSide: p.batSide,
      headshotUrl: p.headshotUrl,
      obp: p.obp,
      slg: p.slg,
    })
  );

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-stone-900 dark:text-stone-100">
        Build your lineup
      </h1>
      <p className="text-stone-600 dark:text-stone-400">
        Drag players from the roster into the batting order and field
        positions. Save to get a shareable link.
      </p>
      <LineupBuilder roster={playerItems} teamId={teamId} />
    </div>
  );
}
