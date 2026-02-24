# Authentication Setup Guide

## Overview

This guide explains how to set up authentication for the Lavage & Vidange ERP 2026 system.

## Supabase Auth Configuration

### Step 1: Enable Email/Password Auth

1. Go to your Supabase project dashboard
2. Navigate to **Authentication** → **Providers**
3. Enable **Email** provider
4. Disable email confirmation (for development):
   - Go to **Authentication** → **Settings**
   - Disable "Enable email confirmations"

### Step 2: Create Initial Users

Create users via Supabase Dashboard:

1. Go to **Authentication** → **Users** → **Add User**
2. Create the following users:

| Email | Password | Role |
|-------|----------|------|
| admin@lavage-vida.com | password | admin |
| manager@lavage-vida.com | password | manager |
| cashier@lavage-vida.com | password | cashier |
| worker@lavage-vida.com | password | worker |

### Step 3: Set User Roles

After creating users, run this SQL to assign roles:

```sql
-- Update user roles (replace UUIDs with actual user IDs)
UPDATE users SET role = 'admin' WHERE email = 'admin@lavage-vida.com';
UPDATE users SET role = 'manager' WHERE email = 'manager@lavage-vida.com';
UPDATE users SET role = 'cashier' WHERE email = 'cashier@lavage-vida.com';
UPDATE users SET role = 'worker' WHERE email = 'worker@lavage-vida.com';
```

Or create users directly with metadata:

```sql
-- Create user with role in metadata
INSERT INTO auth.users (
  email, 
  encrypted_password, 
  email_confirmed_at,
  raw_user_meta_data
) VALUES (
  'admin@lavage-vida.com',
  crypt('password', gen_salt('bf')),
  NOW(),
  '{"role": "admin", "full_name": "Administrateur"}'::jsonb
);
```

### Step 4: Run RLS Migration

Apply the RLS policies:

1. Go to **SQL Editor** → **New Query**
2. Copy contents of `supabase/migrations/002_rls_policies.sql`
3. Run the script

## Application Login

### Login Page

The login page is available at `/login`.

**Features:**
- Email/password authentication
- Bilingual (French/Arabic)
- Error handling
- Remember me functionality
- Demo credentials display

### Protected Routes

Routes are protected using the `ProtectedRoute` component:

```typescript
import { ProtectedRoute } from './hooks/useAuth';

// In your router
<Route 
  path="/finance" 
  element={
    <ProtectedRoute requiredRoles={['manager', 'admin']}>
      <Finance />
    </ProtectedRoute>
  } 
/>
```

### Role-Based UI

Sidebar automatically hides menu items based on user role:

```typescript
// Check user role in components
import { useAuthStore } from './stores/useAuthStore';

const { user, hasRole } = useAuthStore();

// Show admin-only features
if (hasRole(['admin'])) {
  // Render admin UI
}

// Show manager+ features
if (hasRole(['manager', 'admin'])) {
  // Render manager UI
}
```

## Role Hierarchy

```
admin (full access)
  └── manager (operational access)
      └── cashier (sales & payments)
          └── worker (basic operations)
```

### Permissions by Role

| Feature | Admin | Manager | Cashier | Worker |
|---------|-------|---------|---------|--------|
| Dashboard | ✅ | ✅ | ✅ | ✅ |
| Queue Management | ✅ | ✅ | ✅ | ✅ |
| POS | ✅ | ✅ | ✅ | ✅ |
| Customers | ✅ | ✅ | ✅ (read) | ✅ (read) |
| Finance | ✅ | ✅ | ❌ | ❌ |
| Reports | ✅ | ✅ | ❌ | ❌ |
| Settings | ✅ | ❌ | ❌ | ❌ |

## Session Management

### Auto-Refresh

Sessions are automatically refreshed by Supabase.

### Logout

```typescript
import { useAuthStore } from './stores/useAuthStore';
import { supabase } from './lib/supabase';

const { logout } = useAuthStore();

// Logout user
await supabase.auth.signOut();
logout(); // Clear local state
```

## Security Best Practices

1. **Never expose service role key** - Only use the anon/public key in frontend
2. **RLS is enforced** - Database-level security cannot be bypassed
3. **Validate on both ends** - Frontend validation + database constraints
4. **Audit sensitive actions** - Financial transactions are logged

## Troubleshooting

### Login Fails

1. Check Supabase credentials in `.env`
2. Verify user exists in `auth.users`
3. Check browser console for errors

### RLS Policy Errors

1. Verify RLS is enabled: `SELECT * FROM pg_policies;`
2. Test policies in SQL Editor
3. Check user role: `SELECT auth.uid(), get_current_user_role();`

### Session Issues

1. Clear browser storage
2. Check Supabase session settings
3. Verify auth webhook configuration

## Next Steps

After authentication is set up:
- Phase 5: Queue Management Module
- Phase 6: POS Module
- Continue with remaining phases

## Support

- Supabase Auth Docs: https://supabase.com/docs/guides/auth
- PostgreSQL RLS: https://postgresql.org/docs/current/ddl-rowsecurity.html
