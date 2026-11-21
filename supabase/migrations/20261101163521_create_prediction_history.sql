/*
# Create prediction history table

1. New Tables
- `predictions`
  - `id` (uuid, primary key)
  - `image_url` (text, nullable - public URL or base64 thumbnail of the uploaded animal image)
  - `image_thumb` (text, nullable - small base64 data URL for display in history list)
  - `prediction` (text, not null - "Cattle" or "Buffalo")
  - `confidence` (numeric, not null - confidence score 0-100)
  - `cattle_prob` (numeric, not null - cattle probability 0-100)
  - `buffalo_prob` (numeric, not null - buffalo probability 0-100)
  - `confidence_level` (text, not null - "High", "Moderate", or "Low")
  - `is_demo` (boolean, not null default true - true when prediction came from demo/untrained mode)
  - `created_at` (timestamptz, default now)

2. Security
- Enable RLS on `predictions`.
- Grant CRUD to `anon` + `authenticated` since this is a single-tenant app with no sign-in.
- Allow anon + authenticated full CRUD because the data is intentionally shared/public.
*/

CREATE TABLE IF NOT EXISTS predictions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  image_url text,
  image_thumb text,
  prediction text NOT NULL,
  confidence numeric NOT NULL,
  cattle_prob numeric NOT NULL,
  buffalo_prob numeric NOT NULL,
  confidence_level text NOT NULL,
  is_demo boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE predictions ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE, DELETE ON predictions TO anon, authenticated;

DROP POLICY IF EXISTS "anon_select_predictions" ON predictions;
CREATE POLICY "anon_select_predictions" ON predictions FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_predictions" ON predictions;
CREATE POLICY "anon_insert_predictions" ON predictions FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_predictions" ON predictions;
CREATE POLICY "anon_update_predictions" ON predictions FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_predictions" ON predictions;
CREATE POLICY "anon_delete_predictions" ON predictions FOR DELETE
  TO anon, authenticated USING (true);
