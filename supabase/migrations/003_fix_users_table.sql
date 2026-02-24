-- ============================================================
-- FIX: Full schema repair - users table + auth trigger
-- Migration: 003_fix_users_table.sql
-- ============================================================

-- STEP 1: Create user_role enum type if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
    CREATE TYPE user_role AS ENUM ('admin', 'manager', 'cashier', 'worker');
  END IF;
END$$;

-- STEP 2: Create users table if it doesn't exist at all
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  full_name VARCHAR(255),
  role user_role NOT NULL DEFAULT 'worker',
  phone VARCHAR(50),
  avatar_url VARCHAR(500),
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- STEP 3: Add full_name column if table exists but column is missing
ALTER TABLE public.users 
  ADD COLUMN IF NOT EXISTS full_name VARCHAR(255);

-- STEP 4: Add other potentially missing columns
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS role user_role NOT NULL DEFAULT 'worker';
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS phone VARCHAR(50);
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS avatar_url VARCHAR(500);
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS active BOOLEAN DEFAULT true;

-- STEP 5: Fill NULL full_name with email prefix
UPDATE public.users
SET full_name = SPLIT_PART(email, '@', 1)
WHERE full_name IS NULL;

-- ============================================================
-- STEP 6: Create auth trigger to auto-create public.users record
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
RETURNS TRIGGER AS $$
DECLARE
  v_role user_role;
BEGIN
  -- Safely cast role from metadata, fallback to 'worker'
  BEGIN
    v_role := (NEW.raw_user_meta_data->>'role')::user_role;
  EXCEPTION WHEN OTHERS THEN
    v_role := 'worker'::user_role;
  END;

  INSERT INTO public.users (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(
      NEW.raw_user_meta_data->>'full_name',
      NEW.raw_user_meta_data->>'name',
      SPLIT_PART(NEW.email, '@', 1)
    ),
    v_role
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = COALESCE(EXCLUDED.full_name, public.users.full_name);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- STEP 7: Attach trigger to auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_auth_user();

-- ============================================================
-- STEP 8: Grant permissions
-- ============================================================
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON public.users TO postgres, service_role;
GRANT SELECT, INSERT, UPDATE ON public.users TO authenticated;

-- ============================================================
-- VERIFICATION (uncomment to check):
-- SELECT column_name, data_type FROM information_schema.columns 
-- WHERE table_schema = 'public' AND table_name = 'users' ORDER BY ordinal_position;
-- SELECT typname FROM pg_type WHERE typname = 'user_role';
-- ============================================================
