-- ERTI Debug Nerve Center — Supabase migration (self-contained, runs on a fresh project)
-- Creates retained tables first so foreign keys resolve, then the new tables.

CREATE TABLE IF NOT EXISTS engineers (
  id int PRIMARY KEY, no text, last text, first text, name text,
  pos text, team text, hired date, resigned date, status text);

CREATE TABLE IF NOT EXISTS price_settings (
  hw_type text PRIMARY KEY, price numeric DEFAULT 0, placeholder boolean DEFAULT false);

CREATE TABLE IF NOT EXISTS team_budgets (
  team text PRIMARY KEY, budget numeric DEFAULT 0, forecast numeric DEFAULT 0);

CREATE TABLE IF NOT EXISTS manning_targets (
  team text PRIMARY KEY, target int DEFAULT 0);

CREATE TABLE IF NOT EXISTS platform_ratings (
  engineer_id int, platform text, rating int DEFAULT 0,
  PRIMARY KEY (engineer_id, platform));

CREATE TABLE IF NOT EXISTS schedule_entries (
  engineer_id int, schedule_date date, code text,
  PRIMARY KEY (engineer_id, schedule_date));

CREATE TABLE IF NOT EXISTS app_settings (
  id int PRIMARY KEY DEFAULT 1, data jsonb);

-- ── new / changed tables ──
CREATE TABLE IF NOT EXISTS output_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  hardware_id text UNIQUE NOT NULL, hw_type text, activity_category text,
  workweek text, output_date date, engineer_id int REFERENCES engineers(id),
  team text, wip_id uuid, qty int DEFAULT 1,
  created_at timestamptz DEFAULT now(), updated_at timestamptz DEFAULT now());

CREATE TABLE IF NOT EXISTS wip_inventory (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  hardware_id text UNIQUE NOT NULL, hw_type text, tx_category text,
  status text DEFAULT 'Queued', debug_start date, debug_end date,
  engineer_id int REFERENCES engineers(id), team text, notes text,
  created_at timestamptz DEFAULT now(), updated_at timestamptz DEFAULT now());

CREATE TABLE IF NOT EXISTS output_targets (
  id serial PRIMARY KEY, period_type text, period_key text, plan_type text,
  hw_type text, team text DEFAULT 'ALL', target_count int DEFAULT 0,
  UNIQUE (period_type, period_key, plan_type, hw_type, team));

-- WIP snapshots (point-in-time WIP numbers per workweek; one row per WW, upserted)
CREATE TABLE IF NOT EXISTS wip_snapshots (
  period_key   text PRIMARY KEY,        -- WWyyww
  snapped_at   timestamptz DEFAULT now(),
  total_active int DEFAULT 0,
  aged         int DEFAULT 0,
  by_status    jsonb, by_tester jsonb, by_hwtype jsonb, by_team jsonb);

-- NOTE: id columns above are text/int (not gen_random_uuid) for engineers because the
-- app keys engineers by the real employee number. The app uses anon-key upserts;
-- enable RLS + an anon policy per table if your project enforces RLS.
