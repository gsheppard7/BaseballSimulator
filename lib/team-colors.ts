/** Primary club colors, used only as UI accents. */
const TEAM_COLORS: Record<string, string> = {
  ARI: "#A71930",
  AZ: "#A71930",
  ATL: "#CE1141",
  BAL: "#DF4601",
  BOS: "#BD3039",
  CHC: "#0E3386",
  CHW: "#27251F",
  CWS: "#27251F",
  CIN: "#C6011F",
  CLE: "#00385D",
  COL: "#33006F",
  DET: "#0C2340",
  HOU: "#002D62",
  KC: "#004687",
  KCR: "#004687",
  LAA: "#BA0021",
  LAD: "#005A9C",
  MIA: "#00A3E0",
  MIL: "#12284B",
  MIN: "#002B5C",
  NYM: "#002D72",
  NYY: "#132448",
  ATH: "#003831",
  OAK: "#003831",
  PHI: "#E81828",
  PIT: "#27251F",
  SD: "#2F241D",
  SDP: "#2F241D",
  SF: "#FD5A1E",
  SFG: "#FD5A1E",
  SEA: "#0C2C56",
  STL: "#C41E3A",
  TB: "#092C5C",
  TBR: "#092C5C",
  TEX: "#003278",
  TOR: "#134A8E",
  WSH: "#AB0003",
  WSN: "#AB0003",
};

const DIVISION_ORDER = [
  "American League East",
  "American League Central",
  "American League West",
  "National League East",
  "National League Central",
  "National League West",
];

export function teamColor(abbrev: string | null | undefined): string {
  if (!abbrev) return "#146e36";
  return TEAM_COLORS[abbrev.toUpperCase()] ?? "#146e36";
}

/** Pick chalk or ink so a label stays readable on a club color. */
export function onColor(hex: string): string {
  const h = hex.replace("#", "");
  if (h.length !== 6) return "#f6f1e7";
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  const yiq = (r * 299 + g * 587 + b * 114) / 1000;
  return yiq > 170 ? "#121c33" : "#f6f1e7";
}

export function shortDivision(name: string | null | undefined): string {
  if (!name) return "";
  return name.replace("American League", "AL").replace("National League", "NL");
}

export function groupTeams<T extends { name: string; division?: string | null }>(
  teams: T[]
): Array<{ name: string; teams: T[] }> {
  const buckets = new Map<string, T[]>();
  for (const team of teams) {
    const key = team.division || "Other";
    const list = buckets.get(key) ?? [];
    list.push(team);
    buckets.set(key, list);
  }
  for (const list of Array.from(buckets.values())) {
    list.sort((a, b) => a.name.localeCompare(b.name));
  }
  const keys = [
    ...DIVISION_ORDER.filter((division) => buckets.has(division)),
    ...Array.from(buckets.keys()).filter((division) => !DIVISION_ORDER.includes(division)),
  ];
  return keys.map((name) => ({ name, teams: buckets.get(name) ?? [] }));
}
