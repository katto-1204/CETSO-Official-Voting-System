-- ============================================================================
-- CETSO VOTING SYSTEM — SET OFFICIAL ELECTION SCHEDULE
-- ============================================================================
-- Run this in: Supabase Dashboard → SQL Editor → New Query
--
-- Schedule:
--   Start : May 19, 2026 8:00 AM PHT (Philippines Standard Time, UTC+8)
--   End   : May 20, 2026 8:00 AM PHT
--
-- Stored as: datetime-local strings ('YYYY-MM-DDTHH:MM') which the
-- browser/app treats as local time (PHT on all school machines).
-- ============================================================================

-- Ensure the election_config table exists first.
CREATE TABLE IF NOT EXISTS public.election_config (
  key   TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

-- Enable RLS (safe default — admin role can write, anon can read)
ALTER TABLE public.election_config ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read election config" ON public.election_config;
CREATE POLICY "Anyone can read election config"
  ON public.election_config FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "Authenticated can write election config" ON public.election_config;
CREATE POLICY "Authenticated can write election config"
  ON public.election_config FOR ALL TO authenticated USING (true) WITH CHECK (true);

GRANT SELECT ON public.election_config TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.election_config TO authenticated;

-- Upsert the official schedule.
INSERT INTO public.election_config (key, value)
VALUES
  ('enabled',    'true'),
  ('start_date', '2026-05-19T08:00'),
  ('end_date',   '2026-05-20T08:00')
ON CONFLICT (key)
DO UPDATE SET value = EXCLUDED.value;

-- Verify
SELECT key, value FROM public.election_config ORDER BY key;

-- Notify PostgREST & real-time clients
NOTIFY pgrst, 'reload schema';
