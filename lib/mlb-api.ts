const MLB_BASE = process.env.MLB_API_BASE ?? "https://statsapi.mlb.com/api";
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24h
const cache = new Map<string, { data: unknown; expires: number }>();

function getCached<T>(key: string): T | null {
  const entry = cache.get(key);
  if (!entry || Date.now() > entry.expires) return null;
  return entry.data as T;
}

function setCache(key: string, data: unknown) {
  cache.set(key, { data, expires: Date.now() + CACHE_TTL_MS });
}

async function fetchJson<T>(path: string): Promise<T> {
  const url = `${MLB_BASE}${path}`;
  const res = await fetch(url, { next: { revalidate: 86400 } });
  if (!res.ok) throw new Error(`MLB API ${path}: ${res.status}`);
  return res.json();
}

async function fetchCached<T>(key: string, path: string): Promise<T> {
  const hit = getCached<T>(key);
  if (hit) return hit;
  const data = await fetchJson<T>(path);
  setCache(key, data);
  return data;
}

export interface TeamsResponse {
  teams: Array<{
    id: number;
    name: string;
    abbreviation: string;
    teamName?: string;
    division?: { id: number; name: string };
    sport?: { id: number; name: string };
  }>;
}

export async function fetchTeams(season = 2024): Promise<TeamsResponse> {
  return fetchCached(
    `teams:${season}`,
    `/v1/teams?season=${season}&sportId=1`
  );
}

export interface RosterResponse {
  roster: Array<{
    person: { id: number };
    jerseyNumber?: string;
    position: { code: string; name: string; type: string };
  }>;
}

export async function fetchRoster(teamId: number, rosterType = "active"): Promise<RosterResponse> {
  return fetchCached(
    `roster:${teamId}:${rosterType}`,
    `/v1/teams/${teamId}/roster?rosterType=${rosterType}`
  );
}

export interface PersonResponse {
  people: Array<{
    id: number;
    fullName: string;
    primaryNumber?: string;
    primaryPosition?: { code: string; name: string; type: string };
    batSide?: { code: string; description: string };
    pitchHand?: { code: string; description: string };
  }>;
}

export async function fetchPerson(playerId: number): Promise<PersonResponse> {
  return fetchCached(`person:${playerId}`, `/v1/people/${playerId}`);
}

export interface PersonStatsResponse {
  stats: Array<{
    group: { displayName: string };
    stats?: Array<{ name: string; value?: string | number }>;
    splits?: Array<{ stat: Record<string, string | number> }>;
  }>;
}

export async function fetchPersonStats(playerId: number, season = 2024): Promise<PersonStatsResponse | null> {
  const key = `personStats:${playerId}:${season}`;
  const hit = getCached<PersonStatsResponse>(key);
  if (hit) return hit;
  try {
    const data = await fetchJson<PersonStatsResponse>(
      `/v1/people/${playerId}/stats?stats=season&season=${season}`
    );
    setCache(key, data);
    return data;
  } catch {
    return null;
  }
}

function parseStat(stats: PersonStatsResponse): {
  obp: string | null;
  slg: string | null;
  bbPct: string | null;
  kPct: string | null;
  sb: number;
  cs: number;
  pa: number;
} {
  let obp: string | null = null;
  let slg: string | null = null;
  let bbPct: string | null = null;
  let kPct: string | null = null;
  let sb = 0;
  let cs = 0;
  let pa = 0;
  for (const group of stats.stats ?? []) {
    const splits = group.splits ?? [];
    if (splits.length > 0) {
      const s = splits[0].stat as Record<string, string | number>;
      obp = s?.onBasePct != null ? String(s.onBasePct) : obp;
      slg = s?.sluggingPct != null ? String(s.sluggingPct) : slg;
      bbPct = s?.bbPct != null ? String(s.bbPct) : bbPct;
      kPct = s?.avg != null && s?.strikeOutPct != null ? String(s.strikeOutPct) : kPct;
      sb = Number(s?.stolenBases ?? sb);
      cs = Number(s?.caughtStealing ?? cs);
      pa = Number(s?.plateAppearances ?? s?.atBats ?? pa);
    }
    const statList = group.stats ?? [];
    for (const st of statList) {
      if (st.name === "onBasePct") obp = String(st.value ?? "");
      if (st.name === "sluggingPct") slg = String(st.value ?? "");
      if (st.name === "plateAppearances") pa = Number(st.value ?? 0);
    }
  }
  return { obp, slg, bbPct, kPct, sb, cs, pa };
}

export async function fetchPlayerWithStats(
  playerId: number,
  teamId: string,
  depthOrder: number,
  season = 2024
): Promise<{
  id: string;
  mlbId: number;
  name: string;
  positions: string;
  batSide: string | null;
  throwSide: string | null;
  headshotUrl: string | null;
  depthOrder: number;
  obp: string | null;
  slg: string | null;
  bbPct: string | null;
  kPct: string | null;
  sb: number;
  cs: number;
  defRuns: string | null;
  pa: number;
  season: number;
  teamId: string;
}> {
  const [personRes, statsRes] = await Promise.all([
    fetchPerson(playerId),
    fetchPersonStats(playerId, season),
  ]);
  const person = personRes.people?.[0];
  const name = person?.fullName ?? `Player ${playerId}`;
  const primaryPos = person?.primaryPosition?.code ?? "UN";
  const batSide = person?.batSide?.code ?? null;
  const throwSide = person?.pitchHand?.code ?? null;
  const headshotUrl = `https://img.mlbstatic.com/mlb-photos/image/upload/d_people:generic:headshot:silo:current.png/r_max/w_80,q_auto:low,f_auto/v1/people/${playerId}/headshot/silo/current`;
  const stats = statsRes ? parseStat(statsRes) : { obp: null, slg: null, bbPct: null, kPct: null, sb: 0, cs: 0, pa: 0 };
  return {
    id: `mlb-${playerId}`,
    mlbId: playerId,
    name,
    positions: primaryPos,
    batSide,
    throwSide,
    headshotUrl,
    depthOrder,
    obp: stats.obp,
    slg: stats.slg,
    bbPct: stats.bbPct,
    kPct: stats.kPct,
    sb: stats.sb,
    cs: stats.cs,
    defRuns: null,
    pa: stats.pa,
    season,
    teamId,
  };
}
