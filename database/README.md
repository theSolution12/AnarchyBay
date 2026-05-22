# Anarchy Bay Database

This folder contains the Supabase local project and SQL migrations.

- Supabase config: `database/supabase/config.toml`
- Migrations: `database/supabase/migrations/*.sql`

The app currently uses a `profiles` table with an added `name` column (default `Anonymous`).

## Prerequisites

- Supabase CLI (>= v2)
- Docker (for local dev) or a linked Supabase project for remote pushes

Optional but handy:
- `pnpm` or `npm` just for scripting convenience
- `psql` or `pg_dump` for schema exports

## Quick start (local Supabase)

```bash
# From the repo root or ./database
cd database

# Start local Supabase (Postgres, Auth, REST, etc.)
supabase start

# Apply migrations to local database
supabase migration up

# Check service status
supabase status
```

Local connection details will be printed by `supabase status`. The CLI stores runtime info in `database/supabase/.temp/`.

## Migrations

All migrations live under `database/supabase/migrations/` and are versioned SQL files. Example files:
- `20251205133714_profile_table.sql`
- `20251205140021_add_name_to_profiles.sql`

### Create a new migration

Two common flows:

1) Manual SQL file:
```bash
# Create an empty, timestamped SQL migration
supabase migration new add_products_table
# Edit the new SQL file under supabase/migrations and add DDL
```

2) Diff-based (from local DB changes):
```bash
# Make DDL changes directly to the local DB (via psql or GUI)
# Then generate a diff migration
supabase db diff --use-mig-dir --schema public --name add_indices
```

### Apply migrations locally

```bash
# Apply all pending migrations
supabase migration up

# Revert the last migration (use with care)
supabase migration down
```

### Reset local DB (nukes data)

```bash
# Stop services
supabase stop
# Remove volumes and containers
supabase clean
# Start fresh and re-apply migrations
supabase start && supabase migration up
```

## Push to remote (Supabase Cloud)

Link your local project to a Supabase project once:
```bash
cd database
supabase link --project-ref <your-project-ref>
```

Then push database changes:
```bash
# Push the current local schema as a migration to the linked project
supabase db push
```

Notes:
- `supabase db push` bundles local schema changes into a migration and applies them to your cloud project.
- Keep `supabase/config.toml` in sync and avoid editing the `.temp` files; they are generated.

### Pull remote schema (optional)
```bash
# Pull remote schema into local
supabase db pull --schema public
# Optionally generate a diff for local migrations
supabase db diff --use-mig-dir --name sync_with_remote
```

## Schema visualization

There are a few easy options to visualize your schema.

### Option A: dbdiagram.io (fast)
1. Export schema to DBML using Supabase CLI or `pg_dump` + convert.
2. Paste DBML into https://dbdiagram.io to view the ERD.

Quick path using `pg_dump` and dbdiagram's parser:
```bash
# Export only schema (no data) from local
PG_URL=$(supabase status | grep -i 'DB URL' | awk -F': ' '{print $2}')
pg_dump --schema-only "$PG_URL" > schema.sql
# Open dbdiagram.io and import the SQL file
```

### Option B: SchemaSpy (self-hosted)
1. Install Java and run SchemaSpy against your local Postgres.
2. It generates a static HTML ERD you can browse.

Basic idea:
```bash
# Example (adjust paths/versions)
java -jar schemaspy.jar \
  -t pgsql \
  -host localhost \
  -port 54322 \
  -db postgres \
  -u postgres \
  -p postgres \
  -o ./schema-docs
```
Ports/user/password match `supabase status` output for local.

### Option C: pgModeler / DBeaver
GUI tools can reverse-engineer ERDs from a live Postgres connection.

## Tips & conventions

- Prefer additive migrations (avoid dropping columns unless necessary).
- Use `IF EXISTS` and `IF NOT EXISTS` in SQL for safer deploys.
- Test migrations locally before pushing to cloud.
- Keep migration names descriptive and small.

## Troubleshooting

- Migrations fail locally:
  - Inspect the failing SQL in `supabase/migrations/` and test in `psql`.
  - Ensure services are running: `supabase status`.

- `db push` errors:
  - Verify you are linked: `supabase status` shows project-ref.
  - Your local schema might diverge; consider `supabase db pull` then `db diff`.

- Auth/Row Level Security:
  - Supabase enables RLS by default; ensure policies are set for your tables.

---

Maintainer notes:
- Current branch: `auth`.
- Example migration adding `name` column:
  ```sql
  ALTER TABLE IF EXISTS profiles
  ADD COLUMN IF NOT EXISTS name TEXT NOT NULL DEFAULT 'Anonymous';
  ```