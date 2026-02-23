import { pgTable, text, integer, timestamp, jsonb, index } from "drizzle-orm/pg-core";

export const teams = pgTable("teams", {
  id: text("id").primaryKey(),
  mlbId: integer("mlb_id").notNull(),
  abbrev: text("abbrev").notNull(),
  name: text("name").notNull(),
  division: text("division"),
  logoUrl: text("logo_url"),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

export const players = pgTable(
  "players",
  {
    id: text("id").primaryKey(),
    mlbId: integer("mlb_id").notNull(),
    teamId: text("team_id")
      .notNull()
      .references(() => teams.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    positions: text("positions").notNull(), // comma-separated e.g. "SS,2B"
    batSide: text("bat_side"),
    throwSide: text("throw_side"),
    headshotUrl: text("headshot_url"),
    depthOrder: integer("depth_order"),
    obp: text("obp"),
    slg: text("slg"),
    woba: text("woba"),
    bbPct: text("bb_pct"),
    kPct: text("k_pct"),
    sb: integer("sb"),
    cs: integer("cs"),
    defRuns: text("def_runs"),
    pa: integer("pa"),
    season: integer("season"),
    isMinorLeaguer: text("is_minor_leaguer"),
    source: text("source"),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
  },
  (t) => [
    index("players_team_season_idx").on(t.teamId, t.season),
    index("players_mlb_season_idx").on(t.mlbId, t.season),
  ]
);

export const lineups = pgTable("lineups", {
  id: text("id").primaryKey(),
  shareSlug: text("share_slug").notNull().unique(),
  teamId: text("team_id")
    .notNull()
    .references(() => teams.id, { onDelete: "cascade" }),
  name: text("name"),
  battingOrder: jsonb("batting_order").$type<string[]>().notNull(),
  positions: jsonb("positions").$type<Record<string, string>>().notNull(),
  bench: jsonb("bench").$type<string[]>(),
  bullpen: jsonb("bullpen").$type<string[]>(),
  constraintTags: jsonb("constraint_tags").$type<string[]>(),
  isPublic: text("is_public"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

export const lineupScores = pgTable(
  "lineup_scores",
  {
    id: text("id").primaryKey(),
    lineupId: text("lineup_id")
      .notNull()
      .references(() => lineups.id, { onDelete: "cascade" }),
    runsPerGame: text("runs_per_game"),
    winsPer162: text("wins_per_162"),
    playoffOdds: text("playoff_odds"),
    lineupScore: text("lineup_score"),
    metricVersion: text("metric_version"),
    simRunCount: integer("sim_run_count"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  },
  (t) => [index("lineup_scores_lineup_version_idx").on(t.lineupId, t.metricVersion)]
);

export const leaderboardEntries = pgTable(
  "leaderboard_entries",
  {
    id: text("id").primaryKey(),
    lineupId: text("lineup_id")
      .notNull()
      .references(() => lineups.id, { onDelete: "cascade" }),
    teamId: text("team_id")
      .notNull()
      .references(() => teams.id, { onDelete: "cascade" }),
    score: text("score").notNull(),
    constraintTags: jsonb("constraint_tags").$type<string[]>(),
    displayName: text("display_name").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  },
  (t) => [
    index("leaderboard_team_score_idx").on(t.teamId, t.score),
    index("leaderboard_constraint_score_idx").on(t.constraintTags, t.score),
  ]
);

export type Team = typeof teams.$inferSelect;
export type Player = typeof players.$inferSelect;
export type Lineup = typeof lineups.$inferSelect;
export type LineupScore = typeof lineupScores.$inferSelect;
export type LeaderboardEntry = typeof leaderboardEntries.$inferSelect;
