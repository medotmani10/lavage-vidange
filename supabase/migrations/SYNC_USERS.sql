-- هذا السكريبت يقوم باسترجاع المستخدمين الموجودين في المصادقة (Auth) 
-- وإعادة إدخالهم في جدول users العام (public) الذي تم مسحه بالخطأ.

INSERT INTO public.users (id, email, full_name, role, active, created_at, updated_at)
SELECT 
  id, 
  email, 
  COALESCE(raw_user_meta_data->>'full_name', raw_user_meta_data->>'name', SPLIT_PART(email, '@', 1)) as full_name,
  -- تعيين دور المدير كافتراضي للتمكن من الدخول واستعادة الصلاحيات
  COALESCE((raw_user_meta_data->>'role')::user_role, 'admin'::user_role) as role,
  true as active,
  created_at,
  updated_at
FROM auth.users
ON CONFLICT (id) DO NOTHING;
