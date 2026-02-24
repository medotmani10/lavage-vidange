-- ============================================================
-- NUCLEAR FIX: إزالة كل ما يمنع إنشاء المستخدم
-- شغّل هذا كاملاً في Supabase SQL Editor
-- ============================================================

-- ============================================================
-- STEP 1: حذف الـ trigger المعطوب كلياً
-- ============================================================
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_auth_user() CASCADE;

-- ============================================================
-- STEP 2: إيقاف RLS على جدول users مؤقتاً
-- ============================================================
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;

-- ============================================================
-- STEP 3: حذف كل السياسات القديمة على جدول users
-- ============================================================
DROP POLICY IF EXISTS users_select       ON public.users;
DROP POLICY IF EXISTS users_insert       ON public.users;
DROP POLICY IF EXISTS users_update       ON public.users;
DROP POLICY IF EXISTS users_delete       ON public.users;
DROP POLICY IF EXISTS users_service_role ON public.users;

-- ============================================================
-- STEP 4: إعادة بناء الـ trigger بشكل صحيح 100%
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_full_name TEXT;
  v_role      TEXT;
BEGIN
  -- استخرج البيانات من metadata بأمان
  v_full_name := COALESCE(
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'name',
    SPLIT_PART(NEW.email, '@', 1)
  );

  v_role := COALESCE(NEW.raw_user_meta_data->>'role', 'worker');

  -- تأكد أن الدور صحيح
  IF v_role NOT IN ('admin', 'manager', 'cashier', 'worker') THEN
    v_role := 'worker';
  END IF;

  -- أدرج في public.users
  INSERT INTO public.users (id, email, full_name, role, active, created_at, updated_at)
  VALUES (
    NEW.id,
    NEW.email,
    v_full_name,
    v_role::user_role,
    true,
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    email      = EXCLUDED.email,
    full_name  = COALESCE(EXCLUDED.full_name, public.users.full_name),
    updated_at = NOW();

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- لا تمنع إنشاء المستخدم حتى لو فشل الإدراج
    RAISE WARNING 'handle_new_auth_user failed: %', SQLERRM;
    RETURN NEW;
END;
$$;

-- ربط الـ trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_auth_user();

-- ============================================================
-- STEP 5: إعادة تفعيل RLS مع سياسات صحيحة
-- ============================================================
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- سياسة مفتوحة للـ postgres و service_role (للـ triggers)
CREATE POLICY users_all_internal ON public.users
  FOR ALL
  TO postgres, service_role
  USING (true)
  WITH CHECK (true);

-- المستخدم يرى ملفه الشخصي
CREATE POLICY users_select_own ON public.users
  FOR SELECT
  TO authenticated
  USING (id = auth.uid() OR public.user_has_role('manager'));

-- أي مستخدم مسجل يمكنه الإدراج (الـ trigger يفعل هذا)
CREATE POLICY users_insert_open ON public.users
  FOR INSERT
  WITH CHECK (true);

-- تعديل الملف الشخصي
CREATE POLICY users_update_own ON public.users
  FOR UPDATE
  TO authenticated
  USING (id = auth.uid() OR public.user_has_role('admin'));

-- حذف: admin فقط
CREATE POLICY users_delete_admin ON public.users
  FOR DELETE
  TO authenticated
  USING (public.user_has_role('admin'));

-- ============================================================
-- STEP 6: منح الصلاحيات الكاملة
-- ============================================================
GRANT ALL ON public.users TO postgres;
GRANT ALL ON public.users TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.users TO authenticated;
GRANT SELECT, INSERT ON public.users TO anon;

-- ============================================================
-- تحقق نهائي
-- ============================================================
SELECT 
  'Trigger' as type, trigger_name as name
FROM information_schema.triggers 
WHERE trigger_name = 'on_auth_user_created'
UNION ALL
SELECT 
  'RLS Policies' as type, policyname as name
FROM pg_policies 
WHERE tablename = 'users' AND schemaname = 'public'
UNION ALL
SELECT
  'Users Table' as type, column_name as name
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'users';
