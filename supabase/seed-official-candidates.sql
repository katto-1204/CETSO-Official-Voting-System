-- CETSO Voting System - Official Candidates Seed
-- Safe to run multiple times. It updates matching official candidates,
-- inserts missing official candidates, and removes only obsolete candidates
-- that are not referenced by vote_selections.

BEGIN;

CREATE TEMP TABLE official_candidates (
  position_code VARCHAR(50) NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  partylist VARCHAR(100) NOT NULL,
  tagline TEXT,
  bio TEXT,
  image_url TEXT,
  sort_order INTEGER NOT NULL
) ON COMMIT DROP;

INSERT INTO official_candidates (position_code, full_name, partylist, tagline, bio, image_url, sort_order) VALUES
  ('PRESIDENT', 'KYLLE KIAN GIMENA', 'Independent', 'Official CETSO Candidate', 'Official candidate for President.', '/CANDIDATES/KYLLE KIAN GIMENA.png', 1),
  ('INT_VICE_PRESIDENT', 'MICHELLE CAPITAN', 'Independent', 'Official CETSO Candidate', 'Official candidate for Internal Vice President.', '/CANDIDATES/MICHELLE CAPITAN.png', 2),
  ('EXT_VICE_PRESIDENT', 'CASSIEL FLORES', 'Independent', 'Official CETSO Candidate', 'Official candidate for External Vice President.', '/CANDIDATES/CASSIEL FLORES.png', 3),
  ('SECRETARY', 'KEAN JAYCEE D. GUTIERREZ', 'Independent', 'Official CETSO Candidate', 'Official candidate for Secretary.', '/CANDIDATES/KEAN JAYCEE D. GUTIERREZ.png', 4),
  ('ASSISTANT_SECRETARY', 'KRISH KHINOBI BAYALAN', 'Independent', 'Official CETSO Candidate', 'Official candidate for Assistant Secretary.', '/CANDIDATES/KRISH KHINOBI BAYALAN.png', 5),
  ('ASSISTANT_SECRETARY', 'SHELBY HANIEL G. CODILLA', 'Independent', 'Official CETSO Candidate', 'Official candidate for Assistant Secretary.', '/CANDIDATES/SHELBY HANIEL G. CODILLA.png', 6),
  ('TREASURER', 'RACHEL MAE PARAGAS', 'Independent', 'Official CETSO Candidate', 'Official candidate for Treasurer.', '/CANDIDATES/RACHEL MAE PARAGAS.png', 7),
  ('TREASURER', 'EDELJOEL R. MACABULOS', 'Independent', 'Official CETSO Candidate', 'Official candidate for Treasurer.', '/CANDIDATES/EDELJOEL R. MACABULOS.png', 8),
  ('ASSISTANT_TREASURER', 'JIREH MAE D. TUMALA', 'Independent', 'Official CETSO Candidate', 'Official candidate for Assistant Treasurer.', '/CANDIDATES/JIREH MAE D. TUMALA.png', 9),
  ('ASSISTANT_TREASURER', 'JOHN TROY V. MAGHANOY', 'Independent', 'Official CETSO Candidate', 'Official candidate for Assistant Treasurer.', '/CANDIDATES/JOHN TROY V. MAGHANOY.png', 10),
  ('AUDITOR', 'DEXTER MAGUINSAY', 'Independent', 'Official CETSO Candidate', 'Official candidate for Auditor.', '/CANDIDATES/DEXTER MAGUINSAY.png', 11),
  ('BUSINESS_MANAGER', 'CARL JOSHUA D. BALCITA', 'Independent', 'Official CETSO Candidate', 'Official candidate for Business Managers.', '/CANDIDATES/CARL JOSHUA D. BALCITA.png', 12),
  ('BUSINESS_MANAGER', 'NATHANIEL DATAS', 'Independent', 'Official CETSO Candidate', 'Official candidate for Business Managers.', '/CANDIDATES/NATHANIEL DATAS.png', 13),
  ('BUSINESS_MANAGER', 'NOEL IVAN CLAMOR', 'Independent', 'Official CETSO Candidate', 'Official candidate for Business Managers.', '/CANDIDATES/NOEL IVAN CLAMOR.png', 14),
  ('BSCpE_REP_2', 'JULYLYN C. GOREZ', 'Independent', 'Official CETSO Candidate', 'Official candidate for BSCPE 2nd Year Representative.', '/CANDIDATES/JULYLYN C. GOREZ.png', 15),
  ('BSCpE_REP_3', 'JOHN DALE M. CARIN', 'Independent', 'Official CETSO Candidate', 'Official candidate for BSCPE 3rd Year Representative.', '/CANDIDATES/JOHN DALE M. CARIN.png', 16),
  ('BSCpE_REP_4', 'VAL JOSEPH OLAVIDES ANDAL', 'Independent', 'Official CETSO Candidate', 'Official candidate for BSCPE 4th Year Representative.', '/CANDIDATES/VAL JOSEPH OLAVIDES ANDAL.png', 17),
  ('BSCpE_REP_4', 'GLEZA MARIE GAMUTAN', 'Independent', 'Official CETSO Candidate', 'Official candidate for BSCPE 4th Year Representative.', '/CANDIDATES/GLEZA MARIE GAMUTAN.png', 18),
  ('BSECE_REP_2', 'NATHANIEL S. GUILLAMASO', 'Independent', 'Official CETSO Candidate', 'Official candidate for BSECE 2nd Year Representative.', '/CANDIDATES/NATHANIEL S. GUILLAMASO.png', 19),
  ('BSIT_REP_2', 'NATHALIA MAE B. BAGNES', 'Independent', 'Official CETSO Candidate', 'Official candidate for BSIT 2nd Year Representative.', '/CANDIDATES/NATHALIA MAE B. BAGNES.png', 20),
  ('BSIT_REP_3', 'JUSTINE AUDREY P. ROLLENAS', 'Independent', 'Official CETSO Candidate', 'Official candidate for BSIT 3rd Year Representative.', '/CANDIDATES/JUSTINE AUDREY P. ROLLENAS.png', 21),
  ('BSIT_REP_4', 'RHONAN MADARANG', 'Independent', 'Official CETSO Candidate', 'Official candidate for BSIT 4th Year Representative.', '/CANDIDATES/RHONAN MADARANG.png', 22),
  ('BLIS_REP_3', 'RISCIA LOYGI H. BURGOS', 'Independent', 'Official CETSO Candidate', 'Official candidate for BLIS 3rd Year Representative.', '/CANDIDATES/RISCIA LOYGI H. BURGOS.png', 23),
  ('PIO_BSIT', 'JARED SETH R. LO', 'Independent', 'Official CETSO Candidate', 'Official candidate for PIO BSIT.', '/CANDIDATES/JARED SETH R. LO.png', 24),
  ('PIO_BSCpE', 'HINGPIT, MARY GRACE B.', 'Independent', 'Official CETSO Candidate', 'Official candidate for PIO BSCPE.', '/CANDIDATES/HINGPIT, MARY GRACE B..png', 25),
  ('PIO_BSCpE', 'EANNE MARKEISHA A. MORENO', 'Independent', 'Official CETSO Candidate', 'Official candidate for PIO BSCPE.', '/CANDIDATES/EANNE MARKEISHA A. MORENO.png', 26);

UPDATE public.candidates AS c
SET
  partylist = o.partylist,
  tagline = o.tagline,
  bio = o.bio,
  image_url = o.image_url
FROM official_candidates AS o
WHERE c.position_code = o.position_code
  AND c.full_name = o.full_name;

INSERT INTO public.candidates (position_code, full_name, partylist, tagline, bio, image_url)
SELECT o.position_code, o.full_name, o.partylist, o.tagline, o.bio, o.image_url
FROM official_candidates AS o
WHERE NOT EXISTS (
  SELECT 1
  FROM public.candidates AS c
  WHERE c.position_code = o.position_code
    AND c.full_name = o.full_name
);

WITH duplicate_official_candidates AS (
  SELECT id
  FROM (
    SELECT
      c.id,
      row_number() OVER (
        PARTITION BY c.position_code, c.full_name
        ORDER BY c.created_at NULLS LAST, c.id
      ) AS duplicate_rank
    FROM public.candidates AS c
    WHERE EXISTS (
      SELECT 1
      FROM official_candidates AS o
      WHERE o.position_code = c.position_code
        AND o.full_name = c.full_name
    )
  ) ranked
  WHERE ranked.duplicate_rank > 1
)
DELETE FROM public.candidates AS c
USING duplicate_official_candidates AS d
WHERE c.id = d.id
  AND NOT EXISTS (
    SELECT 1
    FROM public.vote_selections AS vs
    WHERE vs.candidate_id = c.id
  )
  AND NOT EXISTS (
    SELECT 1
    FROM public.votes AS v
    WHERE v.selections @> jsonb_build_array(jsonb_build_object('candidateId', c.id::text))
  );

DELETE FROM public.candidates AS c
WHERE NOT EXISTS (
    SELECT 1
    FROM official_candidates AS o
    WHERE o.position_code = c.position_code
      AND o.full_name = c.full_name
  )
  AND NOT EXISTS (
    SELECT 1
    FROM public.vote_selections AS vs
    WHERE vs.candidate_id = c.id
  )
  AND NOT EXISTS (
    SELECT 1
    FROM public.votes AS v
    WHERE v.selections @> jsonb_build_array(jsonb_build_object('candidateId', c.id::text))
  );

COMMIT;
