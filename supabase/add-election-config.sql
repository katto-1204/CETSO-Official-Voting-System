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

ALTER TABLE public.election_config
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

ALTER TABLE public.election_config REPLICA IDENTITY FULL;

-- Enable Row Level Security (RLS)
ALTER TABLE public.election_config ENABLE ROW LEVEL SECURITY;

-- 1. SELECT Policy: Everyone (students and public) can read the election status.
DROP POLICY IF EXISTS "Anyone can read election_config" ON public.election_config;
CREATE POLICY "Anyone can read election_config"
  ON public.election_config FOR SELECT
  TO anon, authenticated
  USING (true);

-- 2. ALL Policy: This app uses a client-side admin panel with the public
-- Supabase client, so the election toggle must be writable by the anon role.
-- Keep the admin route protected in the app UI.
DROP POLICY IF EXISTS "Only admins can modify election_config" ON public.election_config;
DROP POLICY IF EXISTS "Anyone can modify election_config" ON public.election_config;
CREATE POLICY "Anyone can modify election_config"
  ON public.election_config FOR ALL
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- Insert initial default state if not already populated
INSERT INTO public.election_config (key, value)
VALUES 
  ('enabled', 'false'),
  ('start_date', '2026-05-19T08:00'),
  ('end_date', '2026-05-20T08:00')
ON CONFLICT (key) DO NOTHING;

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON public.election_config TO anon, authenticated;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
      AND schemaname = 'public'
      AND tablename = 'election_config'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.election_config;
  END IF;
END $$;
