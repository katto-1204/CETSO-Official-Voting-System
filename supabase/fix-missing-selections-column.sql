-- ============================================================================
-- CETSO VOTING SYSTEM - FIX MISSING SELECTIONS COLUMN + RLS POLICIES
-- ============================================================================
-- Run this in Supabase SQL Editor
-- Dashboard → SQL Editor → New Query → Run
-- ============================================================================

-- Step 1: Add the missing selections column to the votes table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'votes'
      AND column_name = 'selections'
  ) THEN
    ALTER TABLE public.votes
      ADD COLUMN selections JSONB NOT NULL DEFAULT '[]'::jsonb;

    RAISE NOTICE '✅ Added selections JSONB column to votes table.';
  ELSE
    RAISE NOTICE 'ℹ️ selections column already exists. Skipping.';
  END IF;
END $$;


-- Step 2: Enable Row Level Security on votes table
ALTER TABLE public.votes ENABLE ROW LEVEL SECURITY;


-- Step 3: Drop old/conflicting RLS policies if they exist
DROP POLICY IF EXISTS "Allow students to insert votes" ON public.votes;
DROP POLICY IF EXISTS "Allow students to read own vote" ON public.votes;
DROP POLICY IF EXISTS "Allow public insert votes" ON public.votes;
DROP POLICY IF EXISTS "Allow public read votes" ON public.votes;
DROP POLICY IF EXISTS "Enable insert for everyone" ON public.votes;
DROP POLICY IF EXISTS "Enable read access for everyone" ON public.votes;


-- Step 4: Create insert policy
-- This allows the frontend to submit votes.
CREATE POLICY "Allow public insert votes"
ON public.votes
FOR INSERT
TO anon, authenticated
WITH CHECK (true);


-- Step 5: Create read policy
-- This allows the app to check if a student already voted.
CREATE POLICY "Allow public read votes"
ON public.votes
FOR SELECT
TO anon, authenticated
USING (true);


-- Step 6: Verify the selections column exists
SELECT 
  column_name,
  data_type,
  column_default,
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'votes'
  AND column_name = 'selections';


-- Step 7: Verify RLS policies
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename = 'votes';


-- Final success message
SELECT 
  '✅ Done. The votes table now has the selections column and correct RLS policies.' AS status;