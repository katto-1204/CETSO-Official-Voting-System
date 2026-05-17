-- ============================================================================
-- CETSO VOTING SYSTEM - ADD EMAIL COLUMN TO STUDENTS TABLE
-- ============================================================================
-- Run this in the Supabase SQL Editor if your students table is missing
-- the 'email' column (error: "column students.email does not exist").

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'students'
    AND column_name = 'email'
  ) THEN
    ALTER TABLE public.students ADD COLUMN email VARCHAR(255);
    RAISE NOTICE 'Added email column to students table.';
  ELSE
    RAISE NOTICE 'Email column already exists — nothing to do.';
  END IF;
END $$;

-- Also add an upsert-safe policy if you haven't yet
DROP POLICY IF EXISTS "Anyone can upsert students" ON public.students;
CREATE POLICY "Anyone can upsert students"
  ON public.students FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);
