# Row Level Security (RLS) Policies

## Overview

This document describes the access control policies implemented in the Lavage & Vidange ERP 2026 database.

## Role Hierarchy

```
admin (full access)
  └── manager (operational access)
      └── cashier (sales & payments)
          └── worker (basic operations)
```

## Policy Summary by Table

### Users (`users`)
| Action | Allowed Roles | Condition |
|--------|---------------|-----------|
| SELECT | All | Own profile or manager+ |
| INSERT | admin | - |
| UPDATE | All | Own profile or admin |
| DELETE | admin | - |

### Customers (`customers`)
| Action | Allowed Roles | Condition |
|--------|---------------|-----------|
| SELECT | All authenticated | - |
| INSERT | manager+ | - |
| UPDATE | manager+ | - |
| DELETE | admin | - |

### Vehicles (`vehicles`)
| Action | Allowed Roles | Condition |
|--------|---------------|-----------|
| SELECT | All authenticated | - |
| INSERT | manager+ | - |
| UPDATE | manager+ | - |
| DELETE | admin | - |

### Services (`services`)
| Action | Allowed Roles | Condition |
|--------|---------------|-----------|
| SELECT | All authenticated | - |
| ALL | manager+ | - |

### Products (`products`)
| Action | Allowed Roles | Condition |
|--------|---------------|-----------|
| SELECT | All authenticated | - |
| INSERT | manager+ | - |
| UPDATE | manager+ | - |
| DELETE | admin | - |

### Suppliers (`suppliers`)
| Action | Allowed Roles | Condition |
|--------|---------------|-----------|
| SELECT | All authenticated | - |
| ALL | manager+ | - |

### Employees (`employees`)
| Action | Allowed Roles | Condition |
|--------|---------------|-----------|
| SELECT | All | Own record or manager+ |
| ALL | manager+ | - |

### Attendance (`attendance`)
| Action | Allowed Roles | Condition |
|--------|---------------|-----------|
| SELECT | All | Own records or manager+ |
| INSERT | All | Own check-in/out or manager+ |
| UPDATE | manager+ | - |

### Queue Tickets (`queue_tickets`)
| Action | Allowed Roles | Condition |
|--------|---------------|-----------|
| SELECT | All authenticated | - |
| INSERT | All authenticated | - |
| UPDATE | All | Assigned tickets or manager+ |
| DELETE | manager+ | - |

### Commissions (`commissions`)
| Action | Allowed Roles | Condition |
|--------|---------------|-----------|
| SELECT | All | Own commissions or manager+ |
| ALL | manager+ | - |

### Debts (`debts`)
| Action | Allowed Roles | Condition |
|--------|---------------|-----------|
| SELECT | All authenticated | - |
| ALL | manager+ | - |
| DELETE | admin | - |

### Payments (`payments`)
| Action | Allowed Roles | Condition |
|--------|---------------|-----------|
| SELECT | All authenticated | - |
| INSERT | All authenticated | - |
| ALL | manager+ | - |

### Financial Transactions (`financial_transactions`)
| Action | Allowed Roles | Condition |
|--------|---------------|-----------|
| SELECT | manager+ | - |
| INSERT | manager+ | - |
| ALL | admin | - |

## Helper Functions

### `get_current_user_id()`
Returns the UUID of the currently authenticated user.

### `get_current_user_role()`
Returns the role of the currently authenticated user.

### `user_has_role(required_role)`
Checks if the current user has the required role or higher in the hierarchy.

## Usage Examples

### Check User Role in Application
```typescript
import { useAuthStore } from './stores/useAuthStore';

const { user, hasRole } = useAuthStore();

// Check if user is admin
if (hasRole(['admin'])) {
  // Show admin features
}

// Check if user is manager or admin
if (hasRole(['manager', 'admin'])) {
  // Show manager features
}
```

### Protected Route
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

### Supabase Query with RLS
```typescript
import { supabase } from './lib/supabase';

// RLS is automatically applied
const { data } = await supabase
  .from('queue_tickets')
  .select('*')
  .eq('status', 'pending');

// Only returns tickets the user has access to
```

## Security Considerations

1. **RLS is enforced at the database level** - Even if someone bypasses the frontend, they cannot access data they're not authorized for.

2. **Service role key bypasses RLS** - Never expose the service role key in the frontend. Only use the anon/public key.

3. **Triggers run with SECURITY DEFINER** - Some triggers use `SECURITY DEFINER` to bypass RLS for system operations (like creating user records on signup).

4. **Audit logging** - Sensitive operations (financial transactions, stock movements) are logged for audit purposes.

## Testing RLS Policies

### Test as Different Users
```sql
-- Set the role to test as
SET LOCAL ROLE authenticated;
SET auth.uid TO 'user-uuid-here';

-- Run queries to verify access
SELECT * FROM queue_tickets;
```

### Supabase Dashboard
Use the Supabase SQL Editor to test policies:
1. Go to SQL Editor
2. Run queries as different users
3. Verify access is correctly restricted

## Migration

To apply RLS policies:
1. Run `002_rls_policies.sql` in Supabase SQL Editor
2. Verify all policies are created
3. Test with different user roles
