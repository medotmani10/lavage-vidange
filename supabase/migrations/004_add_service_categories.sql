-- Migration to add category column to services table

-- Create the service category enum if it does not exist
DO $$ BEGIN
    CREATE TYPE service_category AS ENUM ('lavage', 'vidange', 'pneumatique');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Add the category column to the services table
ALTER TABLE public.services ADD COLUMN IF NOT EXISTS category service_category DEFAULT 'lavage'::service_category;
