# Baseball Lineup Simulator

Build and simulate MLB lineups. Pick a team, click slots and assign players to batting order and field positions (or search by name), save and share your lineup.

## Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind
- **Backend**: Next.js API routes, Postgres (Drizzle), Python FastAPI sim service (optional)
- **Data**: MLB Stats API (cached)

## Setup

1. **Postgres** (easiest on Mac: [Postgres.app](https://postgresapp.com/)):
   - Download Postgres.app → move to **Applications** → double‑click to open.
   - Click **Initialize** to create a new server. Postgres then runs from the menu bar (no terminal needed).
   - Default: no password, user = your Mac username, port 5432.
   - Create the app database once (in Terminal, with Postgres.app running):
     ```bash
     /Applications/Postgres.app/Contents/Versions/latest/bin/createdb baseball
     ```
     If you add Postgres to your PATH (see [Postgres.app CLI tools](https://postgresapp.com/documentation/cli-tools.html)), you can just run `createdb baseball`.
   - In `.env` use: `DATABASE_URL=postgres://localhost:5432/baseball` (or `postgres://YOUR_MAC_USERNAME@localhost:5432/baseball`).
   - **If you use Homebrew Postgres instead:** start it with `brew services start postgresql`, then create the DB and set `DATABASE_URL` as above (with the correct user/password if needed).
2. Copy `.env.example` to `.env` and set `DATABASE_URL`:
   ```bash
   cp .env.example .env
   ```
   Edit `.env` and set:
   - `DATABASE_URL=postgres://localhost:5432/baseball` (default; use `postgres://user:password@localhost:5432/baseball` if you created a user).
3. Install deps and push the schema:
   ```bash
   npm install
   npx drizzle-kit push
   ```
   Or generate migrations: `npm run db:generate` then `npm run db:migrate`.
3. Start the app:
   ```bash
   npm run dev
   ```
4. Open [http://localhost:3000](http://localhost:3000). Use "Pick a team" to load a roster and build a lineup.

## Sim service (scoring + season simulation)

**To get “Lineup score” and “Simulate season” working**, run the Python sim service in a separate terminal. If it’s not running, those buttons will show an error with the command to start it.

```bash
cd sim-service
pip install -r requirements.txt
PYTHONPATH=. uvicorn sim_service.main:app --reload --port 8008
```

Or with Docker:

```bash
docker build -t lineup-sim ./sim-service
docker run -p 8008:8008 lineup-sim
```

Set `SIM_SERVICE_URL=http://localhost:8008` in `.env` (or leave unset; default is `http://localhost:8008`).

## Deploy

- **Next.js**: Vercel, or any Node host. Set `DATABASE_URL`, `NEXT_PUBLIC_APP_URL`, and optionally `SIM_SERVICE_URL` (your Python service URL).
- **Sim service**: Railway, Render, Fly.io, or a Docker host. No DB required; stateless.
- **Postgres**: Neon, Supabase, or any PostgreSQL provider.
- **Redis**: Optional (Upstash/Redis Cloud) for caching MLB API; in-memory cache is used if Redis is not configured.

## License

Personal/portfolio use. MLB data usage: respectful rate limits and caching; see plan for licensing notes.
