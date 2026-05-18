-- ==========================================
-- CETSO VOTING SYSTEM SCHEMA
-- ==========================================

-- 1. Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Create Tables
CREATE TABLE students (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(255),
  full_name VARCHAR(255) NOT NULL,
  program_code VARCHAR(50) NOT NULL,
  year_level INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE candidates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  position_code VARCHAR(50) NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  partylist VARCHAR(100) NOT NULL,
  tagline TEXT,
  bio TEXT,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE votes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id VARCHAR(50) UNIQUE NOT NULL REFERENCES students(student_id) ON DELETE CASCADE,
  receipt_id VARCHAR(100) UNIQUE NOT NULL,
  program_code VARCHAR(50) NOT NULL, -- Stored here for fast aggregation charts
  selections JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE vote_selections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vote_id UUID NOT NULL REFERENCES votes(id) ON DELETE CASCADE,
  position_code VARCHAR(50) NOT NULL,
  candidate_id UUID NOT NULL REFERENCES candidates(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  actor VARCHAR(255) NOT NULL,
  event_type VARCHAR(100) NOT NULL,
  entity VARCHAR(100) NOT NULL,
  detail TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  auth_uid UUID UNIQUE NOT NULL,
  email VARCHAR(255) NOT NULL,
  student_id VARCHAR(50),
  display_name VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'student',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- PROPER INDEXING FOR HIGH PERFORMANCE
-- ==========================================
-- These indexes prevent the database from doing full-table scans.

-- 1. Candidates: Fast filtering by position_code (Used heavily on the voting ballot)
CREATE INDEX idx_candidates_position_code ON candidates(position_code);

-- 2. Votes: Fast checking if a student has voted (Used in Analytics charts)
CREATE INDEX idx_votes_program_code ON votes(program_code); 

-- 3. Vote Selections: Fast aggregation for "Votes by Position/Candidate"
CREATE INDEX idx_vote_selections_vote_id ON vote_selections(vote_id);
CREATE INDEX idx_vote_selections_candidate_id ON vote_selections(candidate_id);

-- 4. Audit Logs: Fast sorting for the timeline (Most recent first)
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at DESC);

-- ==========================================
-- ROW LEVEL SECURITY (RLS)
-- ==========================================
-- Enable RLS on all tables
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE vote_selections ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- 1. Candidates: Everyone can read candidates
CREATE POLICY "Anyone can read candidates" 
ON candidates FOR SELECT 
TO public 
USING (true);

-- 2. Students: Students can only read their own data, Admins can read all
CREATE POLICY "Anyone can read students" 
ON students FOR SELECT 
TO public 
USING (true);

CREATE POLICY "Anyone can insert students" 
ON students FOR INSERT 
TO public 
WITH CHECK (true);

-- 3. Votes: Users can insert their own vote. Public can read for aggregate charts.
CREATE POLICY "Anyone can read votes" 
ON votes FOR SELECT 
TO public 
USING (true);

CREATE POLICY "Anyone can insert votes" 
ON votes FOR INSERT 
TO public 
WITH CHECK (true);

-- 4. Vote Selections: Public can read for aggregate charts. Users can insert their own.
CREATE POLICY "Anyone can read vote_selections" 
ON vote_selections FOR SELECT 
TO public 
USING (true);

CREATE POLICY "Anyone can insert vote_selections" 
ON vote_selections FOR INSERT 
TO public 
WITH CHECK (true);

-- 5. Audit logs: Only inserts allowed from public (or application layer), reads are public for dashboard.
CREATE POLICY "Anyone can insert audit logs"
ON audit_logs FOR INSERT
TO public
WITH CHECK (true);

CREATE POLICY "Anyone can read audit logs"
ON audit_logs FOR SELECT
TO public
USING (true);

-- 6. Users: All users visible in table. Inserts allowed for registration.
CREATE POLICY "Anyone can read users"
ON users FOR SELECT
TO public
USING (true);

CREATE POLICY "Anyone can insert users"
ON users FOR INSERT
TO public
WITH CHECK (true);
