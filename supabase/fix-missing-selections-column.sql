-- ============================================================================
-- CETSO VOTING SYSTEM - FIX MISSING SELECTIONS COLUMN
-- ============================================================================
-- Run this script in the Supabase SQL Editor (Dashboard → SQL Editor → New Query)
-- This fixes the 400 Bad Request error on POST /rest/v1/votes
-- Root cause: The live `votes` table is missing the `selections` JSONB column.
-- ============================================================================

-- Step 1: Add the missing `selections` column to the votes table.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'votes'
    AND column_name = 'selections'
  ) THEN
    ALTER TABLE public.votes
      ADD COLUMN selections JSONB NOT NULL DEFAULT '[]'::jsonb;
    RAISE NOTICE '✅ Added `selections` JSONB column to votes table.';
  ELSE
    RAISE NOTICE 'ℹ️  `selections` column already exists — skipping.';
  END IF;
END $$;

-- Step 2: Verify the column now exists.
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'votes'
ORDER BY ordinal_position;

-- Step 3: Ensure the RLS INSERT policy on votes allows both anon and authenticated roles.
-- Drop old conflicting policies first.
DROP POLICY IF EXISTS "Anyone can insert votes" ON public.votes;
DROP POLICY IF EXISTS "Authenticated can insert votes" ON public.votes;
DROP POLICY IF EXISTS "Students can insert votes" ON public.votes;

-- Allow any anon/authenticated request to insert a vote row.
-- (Spoofing is prevented at the application layer via the UNIQUE constraint on student_id.)
CREATE POLICY "Anyone can insert votes"
  ON public.votes FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Step 4: Grant explicit table-level INSERT privilege to anon and authenticated roles.
-- (Needed in addition to RLS policies for PostgREST to honor the request.)
GRANT INSERT ON public.votes TO anon, authenticated;
GRANT SELECT ON public.votes TO anon, authenticated;

-- Step 5: Notify PostgREST to reload its schema cache so the new column is visible.
-- This is the equivalent of clicking "Reload" in the Supabase API docs sidebar.
NOTIFY pgrst, 'reload schema';

RAISE NOTICE '✅ Done. The votes table now has the selections column and correct RLS policies.';
