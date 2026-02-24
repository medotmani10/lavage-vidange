-- Add category to services if not exists
ALTER TABLE public.services
  ADD COLUMN IF NOT EXISTS category VARCHAR(50) DEFAULT 'lavage' NOT NULL;
