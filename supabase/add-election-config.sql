-- ============================================================================
-- CETSO VOTING SYSTEM - ELECTION CONFIGURATION TABLE
-- ============================================================================
-- Apply this script in the Supabase SQL Editor to support live production
-- real-time synchronization of voting status across all student portals.

CREATE TABLE IF NOT EXISTS public.election_config (
  key VARCHAR(100) PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.election_config ENABLE ROW LEVEL SECURITY;

-- 1. SELECT Policy: Everyone (students and public) can read the election status.
DROP POLICY IF EXISTS "Anyone can read election_config" ON public.election_config;
CREATE POLICY "Anyone can read election_config"
  ON public.election_config FOR SELECT
  TO anon, authenticated
  USING (true);

-- 2. ALL Policy: Only verified admins can modify the election status.
DROP POLICY IF EXISTS "Only admins can modify election_config" ON public.election_config;
CREATE POLICY "Only admins can modify election_config"
  ON public.election_config FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Insert initial default state if not already populated
INSERT INTO public.election_config (key, value)
VALUES 
  ('enabled', 'true'),
  ('start_date', '2026-05-17T00:00'),
  ('end_date', '2026-05-18T17:00')
ON CONFLICT (key) DO NOTHING;

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON public.election_config TO anon, authenticated;
