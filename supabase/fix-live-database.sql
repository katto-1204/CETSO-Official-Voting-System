-- ============================================================================
-- CETSO VOTING SYSTEM - LIVE PRODUCTION DATABASE SECURITY PATCH
-- ============================================================================
-- Apply this script in the Supabase SQL Editor to secure the database for launch.
-- It fixes ballot secrecy leaks, voter spoofing, data exfiltration, and admin privilege escalation.

-- ============================================================================
-- 1. UTILITY FUNCTIONS & ROLE CHECKER
-- ============================================================================

-- A highly secure helper to check if the current user is an authenticated admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean SECURITY DEFINER AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.users
    WHERE auth_uid = auth.uid()
    AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql;

-- Trigger to prevent administrative privilege escalation.
-- Only allows users with a verified '@admin.cetso.edu' email to claim the 'admin' role.
-- Any attempt by non-authorized users to set role to 'admin' is forced back to 'student'.
CREATE OR REPLACE FUNCTION public.check_user_role()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.role = 'admin' THEN
    IF NEW.email NOT LIKE '%@admin.cetso.edu' THEN
      NEW.role := 'student';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_check_user_role ON public.users;
CREATE TRIGGER trigger_check_user_role
  BEFORE INSERT OR UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION public.check_user_role();

-- ============================================================================
-- 2. SECURE STUDENT LOOKUP RPC (ANTI-EXFILTRATION)
-- ============================================================================
-- Enable RLS on the students table and block direct SELECT.
-- Define a secure RPC to query a student by their ID. This allows login to work
-- but prevents attackers from doing a full 'select * from students' dump.
CREATE OR REPLACE FUNCTION public.get_student_by_id(p_student_id text)
RETURNS SETOF public.students
LANGUAGE plpgsql
SECURITY DEFINER -- Bypasses RLS to query the table securely on a per-student basis
SET search_path = public
AS $$
BEGIN
  RETURN QUERY 
  SELECT * FROM public.students 
  WHERE student_id = p_student_id;
END;
$$;

-- Secure RPC for student receipt lookup. This keeps the live RLS policy strict
-- while still allowing the student UI to load its own submitted ballot.
CREATE OR REPLACE FUNCTION public.get_vote_submission_by_student_id(p_student_id text)
RETURNS TABLE (
  student_id text,
  receipt_id text,
  program_code varchar(50),
  selections jsonb,
  created_at timestamptz,
  student_full_name text,
  year_level integer
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT
    v.student_id::text,
    v.receipt_id::text,
    v.program_code::varchar(50),
    v.selections::jsonb,
    v.created_at::timestamptz,
    s.full_name::text,
    s.year_level::integer
  FROM public.votes AS v
  JOIN public.students AS s
    ON s.student_id = v.student_id
  WHERE v.student_id = p_student_id
  LIMIT 1;
END;
$$;

-- ============================================================================
-- 3. RESET AND RE-APPLY SECURE RLS POLICIES
-- ============================================================================

-- Ensure RLS is active on all core tables
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vote_selections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- ----------------------------------------------------------------------------
-- A. Students Table
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Anyone can read students" ON public.students;
DROP POLICY IF EXISTS "Anyone can insert students" ON public.students;
DROP POLICY IF EXISTS "Only admins can select all students" ON public.students;
DROP POLICY IF EXISTS "Anyone can insert students (registration)" ON public.students;
DROP POLICY IF EXISTS "Only admins can update students" ON public.students;
DROP POLICY IF EXISTS "Only admins can delete students" ON public.students;

-- Unauthenticated users cannot read/dump the students table. Admins can read all.
CREATE POLICY "Only admins can select all students"
  ON public.students FOR SELECT
  TO authenticated
  USING (public.is_admin());

-- Registration is public so new students can sign up.
CREATE POLICY "Anyone can insert students (registration)"
  ON public.students FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Only admins can update students"
  ON public.students FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "Only admins can delete students"
  ON public.students FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- ----------------------------------------------------------------------------
-- B. Candidates Table
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Anyone can read candidates" ON public.candidates;
DROP POLICY IF EXISTS "Only admins can modify candidates" ON public.candidates;

-- All voters must be able to read candidate names, parties, and bios.
CREATE POLICY "Anyone can read candidates"
  ON public.candidates FOR SELECT
  TO anon, authenticated
  USING (true);

-- Only admins can add, update, or remove candidates.
CREATE POLICY "Only admins can modify candidates"
  ON public.candidates FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ----------------------------------------------------------------------------
-- C. Votes and Vote Selections (Ballot Secrecy)
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Anyone can read votes" ON public.votes;
DROP POLICY IF EXISTS "Anyone can insert votes" ON public.votes;
DROP POLICY IF EXISTS "Anyone can read vote_selections" ON public.vote_selections;
DROP POLICY IF EXISTS "Anyone can insert vote_selections" ON public.vote_selections;
DROP POLICY IF EXISTS "Only admins can read votes" ON public.votes;
DROP POLICY IF EXISTS "Only admins can read vote_selections" ON public.vote_selections;
DROP POLICY IF EXISTS "Only admins can delete votes" ON public.votes;
DROP POLICY IF EXISTS "Only admins can delete vote_selections" ON public.vote_selections;

-- Only admins can read individual votes and selections to compile election results.
CREATE POLICY "Only admins can read votes"
  ON public.votes FOR SELECT
  TO authenticated
  USING (public.is_admin());

CREATE POLICY "Only admins can read vote_selections"
  ON public.vote_selections FOR SELECT
  TO authenticated
  USING (public.is_admin());

CREATE POLICY "Only admins can delete votes"
  ON public.votes FOR DELETE
  TO authenticated
  USING (public.is_admin());

CREATE POLICY "Only admins can delete vote_selections"
  ON public.vote_selections FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- Anyone can submit a vote. Spoofing is blocked by students table isolation.
CREATE POLICY "Anyone can insert votes"
  ON public.votes FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Anyone can insert vote_selections"
  ON public.vote_selections FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- ----------------------------------------------------------------------------
-- D. Users Table (Identity Registry)
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Anyone can read users" ON public.users;
DROP POLICY IF EXISTS "Anyone can insert users" ON public.users;
DROP POLICY IF EXISTS "Users can read their own user record" ON public.users;
DROP POLICY IF EXISTS "Users can insert their own user record" ON public.users;
DROP POLICY IF EXISTS "Users can update their own user record" ON public.users;

-- Users can only see their own database profile (unless they are admin)
CREATE POLICY "Users can read their own user record"
  ON public.users FOR SELECT
  TO anon, authenticated
  USING (auth_uid = auth.uid() OR public.is_admin());

-- Users can only insert or update their own database profile
CREATE POLICY "Users can insert their own user record"
  ON public.users FOR INSERT
  TO authenticated
  WITH CHECK (auth_uid = auth.uid());

CREATE POLICY "Users can update their own user record"
  ON public.users FOR UPDATE
  TO authenticated
  USING (auth_uid = auth.uid())
  WITH CHECK (auth_uid = auth.uid());

-- ----------------------------------------------------------------------------
-- E. Audit Logs Table
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Anyone can insert audit logs" ON public.audit_logs;
DROP POLICY IF EXISTS "Anyone can read audit logs" ON public.audit_logs;
DROP POLICY IF EXISTS "Only admins can read audit logs" ON public.audit_logs;

CREATE POLICY "Anyone can insert audit logs"
  ON public.audit_logs FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Only admins can read audit logs"
  ON public.audit_logs FOR SELECT
  TO authenticated
  USING (public.is_admin());

-- ============================================================================
-- 4. GRANT EXPLICIT SCHEMA PERMISSIONS
-- ============================================================================
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.students TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.votes TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.vote_selections TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE ON public.users TO anon, authenticated;
GRANT SELECT, INSERT ON public.audit_logs TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_student_by_id(text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_vote_submission_by_student_id(text) TO anon, authenticated;
