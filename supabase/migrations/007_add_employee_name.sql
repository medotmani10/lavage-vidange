-- Add full_name column to employees to allow standalone creation
ALTER TABLE public.employees
ADD COLUMN IF NOT EXISTS full_name text;

-- Populate existing employees with their linked user's full_name
UPDATE public.employees e
SET full_name = u.full_name
FROM public.users u
WHERE e.user_id = u.id AND e.full_name IS NULL;

-- Make full_name NOT NULL now that existing rows are populated
ALTER TABLE public.employees
ALTER COLUMN full_name SET NOT NULL;

-- Update RLS policies to allow employees to be viewed/managed
-- (This shouldn't change the existing logic, just making sure the column is accessible)
