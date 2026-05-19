-- ============================================================================
-- CETSO PLAN B: CET-ONLY VOTER ELIGIBILITY LOCK
-- ============================================================================
-- Apply in Supabase SQL Editor if any non-CET students/departments can register
-- or vote. This moves eligibility enforcement into Postgres, so bypassing the
-- React UI still cannot create non-CET students or non-CET vote rows.

-- 1. Remove existing invalid rows before adding constraints.
-- Review first, then uncomment DELETE statements only if you want cleanup.
SELECT student_id, full_name, program_code
FROM public.students
WHERE UPPER(program_code) NOT IN ('BSIT', 'BLIS', 'BSCPE', 'BSECE');

SELECT student_id, program_code, created_at
FROM public.votes
WHERE UPPER(program_code) NOT IN ('BSIT', 'BLIS', 'BSCPE', 'BSECE');

-- DELETE FROM public.votes
-- WHERE UPPER(program_code) NOT IN ('BSIT', 'BLIS', 'BSCPE', 'BSECE');

-- DELETE FROM public.students
-- WHERE UPPER(program_code) NOT IN ('BSIT', 'BLIS', 'BSCPE', 'BSECE');

-- 2. Canonicalize BSCpE spelling.
UPDATE public.students SET program_code = 'BSCpE' WHERE UPPER(program_code) = 'BSCPE';
UPDATE public.votes SET program_code = 'BSCpE' WHERE UPPER(program_code) = 'BSCPE';

-- 3. Enforce valid CET student IDs and CET program codes.
ALTER TABLE public.students
  DROP CONSTRAINT IF EXISTS students_cet_student_id_check,
  DROP CONSTRAINT IF EXISTS students_cet_program_code_check;

ALTER TABLE public.students
  ADD CONSTRAINT students_cet_student_id_check
    CHECK (student_id ~ '^598[0-9]{5}$'),
  ADD CONSTRAINT students_cet_program_code_check
    CHECK (program_code IN ('BSIT', 'BLIS', 'BSCpE', 'BSECE'));

ALTER TABLE public.votes
  DROP CONSTRAINT IF EXISTS votes_cet_program_code_check;

ALTER TABLE public.votes
  ADD CONSTRAINT votes_cet_program_code_check
    CHECK (program_code IN ('BSIT', 'BLIS', 'BSCpE', 'BSECE'));

-- 4. Harden the lookup RPC so non-CET rows are invisible to login.
CREATE OR REPLACE FUNCTION public.get_student_by_id(p_student_id text)
RETURNS SETOF public.students
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT *
  FROM public.students
  WHERE student_id = p_student_id
    AND student_id ~ '^598[0-9]{5}$'
    AND program_code IN ('BSIT', 'BLIS', 'BSCpE', 'BSECE');
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_student_by_id(text) TO anon, authenticated;
