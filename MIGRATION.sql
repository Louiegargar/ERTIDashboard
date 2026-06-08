-- ERTI Debug Nerve Center — Supabase migration (Appendix A)
-- Retained tables (engineers, platform_ratings, schedule_entries, team_budgets,
-- price_settings, app_settings, manning_targets) are unchanged.
-- output_entries is SUPERSEDED by output_records.

CREATE TABLE IF NOT EXISTS output_records (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  hardware_id   text UNIQUE NOT NULL,
  hw_type       text,
  activity_category text,
  workweek      text,
  output_date   date,
  engineer_id   int REFERENCES engineers(id),
  team          text,
  wip_id        uuid,
  qty           int DEFAULT 1,
  created_at    timestamptz DEFAULT now(),
  updated_at    timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS wip_inventory (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  hardware_id   text UNIQUE NOT NULL,
  hw_type       text,
  tx_category   text,
  status        text DEFAULT 'Queued',
  debug_start   date,
  debug_end     date,
  engineer_id   int REFERENCES engineers(id),
  team          text,
  notes         text,
  created_at    timestamptz DEFAULT now(),
  updated_at    timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS output_targets (
  id            serial PRIMARY KEY,
  period_type   text,            -- 'weekly' | 'monthly'
  period_key    text,            -- WWyyww | YYYY-MM
  plan_type     text,            -- 'budget' | 'projected'
  hw_type       text,
  team          text DEFAULT 'ALL',
  target_count  int DEFAULT 0,
  UNIQUE (period_type, period_key, plan_type, hw_type, team)
);

-- optional FK once both exist:
-- ALTER TABLE output_records ADD CONSTRAINT fk_wip
--   FOREIGN KEY (wip_id) REFERENCES wip_inventory(id);
