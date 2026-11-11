export interface TeamListItem {
  id: string;
  name: string;
  abbrev: string;
  division?: string | null;
  teamName?: string;
}

export function appBase(): string {
  return process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
}

export async function fetchTeamList(): Promise<TeamListItem[]> {
  const res = await fetch(`${appBase()}/api/teams`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch teams");
  const data = await res.json();
  return Array.isArray(data) ? data : [];
}

export async function fetchTeamMeta(teamId: string): Promise<TeamListItem | null> {
  try {
    const teams = await fetchTeamList();
    return teams.find((team) => team.id === teamId) ?? null;
  } catch {
    return null;
  }
}
