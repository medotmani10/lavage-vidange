-- ============================================================
-- SETUP VERIFICATION SCRIPT
-- Run this to check if your database is properly configured
-- ============================================================

-- Check if tables exist
SELECT 
  'Tables Check' as step,
  COUNT(*) as table_count
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_type = 'BASE TABLE';

-- Check if users table has data
SELECT 
  'Users Table' as step,
  COUNT(*) as user_count
FROM users;

-- Check if RLS is enabled on tables
SELECT 
  'RLS Check' as step,
  COUNT(*) as rls_enabled_count
FROM pg_policies 
WHERE schemaname = 'public';

-- Check if helper functions exist
SELECT 
  'Functions Check' as step,
  COUNT(*) as function_count
FROM pg_proc 
WHERE proname IN ('get_current_user_id', 'get_current_user_role', 'user_has_role', 'create_user_record');

-- List all tables (for debugging)
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_type = 'BASE TABLE'
ORDER BY table_name;
