export interface MLBTeam {
  id: number;
  name: string;
  abbreviation: string;
  teamName: string;
  division?: { id: number; name: string };
  sport?: { id: number; name: string };
}

export interface MLBPerson {
  id: number;
  fullName: string;
  primaryNumber?: string;
  primaryPosition?: { code: string; name: string; type: string };
  batSide?: { code: string; description: string };
  pitchHand?: { code: string; description: string };
}

export interface MLBStats {
  stats: Array<{
    group: { displayName: string };
    stats: Array<{ name: string; value?: string | number }>;
    splits: Array<{ stat: Record<string, string> }>;
  }>;
}

export interface RosterEntry {
  person: { id: number };
  jerseyNumber?: string;
  position: { code: string; name: string; type: string };
}

export interface PlayerWithStats {
  id: string;
  mlbId: number;
  name: string;
  positions: string;
  batSide: string | null;
  throwSide: string | null;
  headshotUrl: string | null;
  depthOrder: number | null;
  obp: string | null;
  slg: string | null;
  bbPct: string | null;
  kPct: string | null;
  sb: number | null;
  cs: number | null;
  defRuns: string | null;
  pa: number | null;
  season: number | null;
  teamId: string;
}

export interface LineupPayload {
  teamId: string;
  name?: string;
  battingOrder: string[];
  positions: Record<string, string>;
  bench?: string[];
  bullpen?: string[];
  constraintTags?: string[];
}

export const POSITION_ORDER = ["P", "C", "1B", "2B", "3B", "SS", "LF", "CF", "RF"] as const;
