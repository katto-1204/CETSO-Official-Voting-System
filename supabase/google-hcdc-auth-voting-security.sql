-- ============================================================================
-- CETSO GOOGLE HCDC AUTH MIGRATION
-- ============================================================================
-- Apply this in Supabase SQL Editor before relying on Google-only student login.
-- It is additive: it does not delete existing students or votes.

-- 1. Add Google ownership columns safely.
ALTER TABLE public.students
  ADD COLUMN IF NOT EXISTS auth_user_id uuid,
  ADD COLUMN IF NOT EXISTS google_email text;

ALTER TABLE public.votes
  ADD COLUMN IF NOT EXISTS auth_user_id uuid,
  ADD COLUMN IF NOT EXISTS google_email text;

ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS google_email text,
  ADD COLUMN IF NOT EXISTS full_name text;

-- 2. Prevent duplicate voting by Google account/email for new OAuth votes.
CREATE UNIQUE INDEX IF NOT EXISTS students_auth_user_id_unique
  ON public.students(auth_user_id)
  WHERE auth_user_id IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS students_google_email_unique
  ON public.students(LOWER(google_email))
  WHERE google_email IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS votes_auth_user_id_unique
  ON public.votes(auth_user_id)
  WHERE auth_user_id IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS votes_google_email_unique
  ON public.votes(LOWER(google_email))
  WHERE google_email IS NOT NULL;

-- If an earlier Google login stored the auth UUID as students.student_id,
-- completing the profile may update that student_id to the real number.
-- Keep existing votes attached during that correction.
DO $$
DECLARE
  fk_name text;
BEGIN
  SELECT conname INTO fk_name
  FROM pg_constraint
  WHERE conrelid = 'public.votes'::regclass
    AND confrelid = 'public.students'::regclass
    AND contype = 'f'
  LIMIT 1;

  IF fk_name IS NOT NULL THEN
    EXECUTE format('ALTER TABLE public.votes DROP CONSTRAINT %I', fk_name);
  END IF;

  ALTER TABLE public.votes
    ADD CONSTRAINT votes_student_id_fkey
    FOREIGN KEY (student_id)
    REFERENCES public.students(student_id)
    ON UPDATE CASCADE
    ON DELETE CASCADE;
END $$;

-- 3. Admin checker used by RLS.
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public.users
    WHERE auth_uid = auth.uid()
      AND role = 'admin'
  );
END;
$$;

-- 4. Student profile lookup no longer requires a student-number/masterlist match.
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
     OR auth_user_id::text = p_student_id
     OR LOWER(google_email) = LOWER(p_student_id);
END;
$$;

-- 5. Receipt lookup for current Google-authenticated voters and admins.
-- RETURNS TABLE signatures cannot be changed in-place, so drop first.
DROP FUNCTION IF EXISTS public.get_vote_submission_by_student_id(text);

CREATE OR REPLACE FUNCTION public.get_vote_submission_by_student_id(p_student_id text)
RETURNS TABLE (
  student_id text,
  receipt_id text,
  program_code varchar(50),
  selections jsonb,
  created_at timestamptz,
  student_full_name text,
  year_level integer,
  google_email text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RETURN;
  END IF;

  RETURN QUERY
  SELECT
    v.student_id::text,
    v.receipt_id::text,
    v.program_code::varchar(50),
    v.selections::jsonb,
    v.created_at::timestamptz,
    s.full_name::text,
    s.year_level::integer,
    COALESCE(v.google_email, s.google_email, s.email)::text
  FROM public.votes AS v
  LEFT JOIN public.students AS s
    ON s.student_id = v.student_id
  WHERE (
      public.is_admin()
      OR v.auth_user_id = auth.uid()
      OR v.student_id = auth.uid()::text
    )
    AND (
      v.student_id = p_student_id
      OR v.auth_user_id::text = p_student_id
      OR LOWER(v.google_email) = LOWER(p_student_id)
    )
  LIMIT 1;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_student_by_id(text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_vote_submission_by_student_id(text) TO anon, authenticated;

-- 6. RLS policies for Google-authenticated voting.
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Google students can upsert own profile" ON public.students;
CREATE POLICY "Google students can upsert own profile"
  ON public.students FOR INSERT
  TO authenticated
  WITH CHECK (
    auth_user_id = auth.uid()
    AND LOWER(COALESCE(google_email, email, '')) LIKE '%@hcdc.edu.ph'
  );

DROP POLICY IF EXISTS "Google students can update own profile" ON public.students;
CREATE POLICY "Google students can update own profile"
  ON public.students FOR UPDATE
  TO authenticated
  USING (auth_user_id = auth.uid() OR public.is_admin())
  WITH CHECK (
    public.is_admin()
    OR (
      auth_user_id = auth.uid()
      AND LOWER(COALESCE(google_email, email, '')) LIKE '%@hcdc.edu.ph'
    )
  );

DROP POLICY IF EXISTS "Google students can read own profile" ON public.students;
CREATE POLICY "Google students can read own profile"
  ON public.students FOR SELECT
  TO authenticated
  USING (auth_user_id = auth.uid() OR public.is_admin());

DROP POLICY IF EXISTS "Google HCDC users can insert own vote" ON public.votes;
CREATE POLICY "Google HCDC users can insert own vote"
  ON public.votes FOR INSERT
  TO authenticated
  WITH CHECK (
    auth_user_id = auth.uid()
    AND LOWER(COALESCE(google_email, '')) LIKE '%@hcdc.edu.ph'
  );

DROP POLICY IF EXISTS "Google users can read own vote" ON public.votes;
CREATE POLICY "Google users can read own vote"
  ON public.votes FOR SELECT
  TO authenticated
  USING (auth_user_id = auth.uid() OR student_id = auth.uid()::text OR public.is_admin());
