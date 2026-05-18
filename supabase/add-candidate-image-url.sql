-- CETSO Voting System - Add candidate photo support
-- Safe to run multiple times in the Supabase SQL Editor.

ALTER TABLE public.candidates
ADD COLUMN IF NOT EXISTS image_url TEXT;
