-- Add pin_code to users table
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS pin_code text;

-- Add comment
COMMENT ON COLUMN public.users.pin_code IS 'Optional PIN code for offline login access';

-- Force schema cache reload (Supabase convention)
NOTIFY pgrst, 'reload schema';
