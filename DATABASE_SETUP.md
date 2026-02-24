# Supabase Database Setup Guide

## Prerequisites

1. Create a free account at [supabase.com](https://supabase.com)
2. Create a new project

## Setup Steps

### Step 1: Run the Migration

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor** → **New Query**
3. Copy the contents of `supabase/migrations/001_initial_schema.sql`
4. Paste and run the SQL script
5. Verify all tables, views, and triggers are created successfully

### Step 2: Configure Environment Variables

1. Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

2. Get your Supabase credentials from:
   - Go to **Settings** → **API**
   - Copy the **Project URL** and **anon/public key**

3. Update `.env`:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### Step 3: Create First Admin User

1. Go to **Authentication** → **Users** → **Add User**
2. Create an admin user with email/password
3. Note the user ID
4. Run this SQL to set the role:
```sql
UPDATE users 
SET role = 'admin' 
WHERE email = 'admin@lavage-vida.com';
```

## Database Schema Overview

### Core Tables

| Table | Description |
|-------|-------------|
| `users` | User accounts with roles (admin, manager, cashier, worker) |
| `customers` | Customer profiles with credit tracking |
| `vehicles` | Customer vehicles (linked to customers) |
| `services` | Service catalog (bilingual, with pricing & commissions) |
| `products` | Inventory items (tires, oils, accessories) |
| `suppliers` | Supplier profiles with balance tracking |
| `employees` | Employee records with commission tracking |
| `attendance` | Employee check-in/out logs |
| `queue_tickets` | Service tickets with status & priority |
| `ticket_services` | Services linked to tickets |
| `ticket_products` | Products linked to tickets |
| `commissions` | Employee commission records |
| `debts` | Customer debt/credit tracking |
| `payments` | Payment records |
| `purchase_invoices` | Supplier invoices |
| `financial_transactions` | General ledger transactions |
| `stock_movements` | Inventory audit log |
| `loyalty_transactions` | Loyalty points history |

### Views (Real-time Reports)

| View | Description |
|------|-------------|
| `view_daily_revenue` | Daily revenue summary |
| `view_current_queue` | Live queue status |
| `view_low_stock_products` | Products below minimum stock |
| `view_employee_commissions` | Commission summary per employee |
| `view_customer_debts` | Customer debts summary |
| `view_dashboard_stats` | Overall dashboard statistics |

### Automated Triggers

| Trigger | Action |
|---------|--------|
| `update_*_updated_at` | Auto-update `updated_at` timestamp |
| `generate_ticket_number` | Auto-generate ticket numbers (YYYYMMDD-0001) |
| `update_ticket_totals` | Calculate totals, tax, discount |
| `update_stock_on_ticket_complete` | Decrease stock when ticket completed |
| `update_customer_balance_on_payment` | Update customer balance on payment |
| `create_commission_on_ticket_complete` | Create commission records |
| `update_loyalty_points_on_payment` | Award loyalty points on payment |

## Testing the Database

### Insert Sample Data

```sql
-- Add a test customer
INSERT INTO customers (full_name, phone, credit_limit) 
VALUES ('Test Customer', '0550123456', 10000);

-- Add a test vehicle
INSERT INTO vehicles (customer_id, plate_number, brand, model, year, odometer)
SELECT 
  c.id, 
  '12345-ABC-19', 
  'Toyota', 
  'Corolla', 
  2019, 
  50000
FROM customers c 
WHERE c.phone = '0550123456';

-- Add a test employee
INSERT INTO employees (user_id, position, phone, commission_rate)
SELECT 
  u.id,
  'Technician',
  '0550987654',
  10.00
FROM users u 
WHERE u.email = 'worker@lavage-vida.com';
```

### Test Queue Ticket Creation

```sql
-- Create a test ticket
INSERT INTO queue_tickets (
  customer_id, 
  vehicle_id, 
  subtotal, 
  tax_rate, 
  assigned_employee_id,
  status
)
SELECT 
  c.id,
  v.id,
  3500,
  0,
  e.id,
  'pending'
FROM customers c
JOIN vehicles v ON v.customer_id = c.id
CROSS JOIN employees e
WHERE c.phone = '0550123456'
LIMIT 1;
```

## Row Level Security (RLS)

**Important:** RLS policies are configured in Phase 3. After completing Phase 3, all tables will have proper access controls.

## Backup & Restore

### Export Data

Use Supabase CLI:
```bash
supabase db dump -f backup.sql
```

### Restore Data

```bash
supabase db reset --db-url postgresql://postgres:password@db.your-project.supabase.co:5432/postgres
```

## Useful Queries

### Get Today's Revenue
```sql
SELECT * FROM view_dashboard_stats;
```

### Get Current Queue
```sql
SELECT * FROM view_current_queue;
```

### Get Low Stock Products
```sql
SELECT * FROM view_low_stock_products;
```

### Get Customer with Debts
```sql
SELECT * FROM view_customer_debts;
```

## Next Steps

After setting up the database:
1. **Phase 3:** Configure Authentication & RLS Policies
2. **Phase 5:** Build Queue Management UI
3. **Phase 6:** Build POS Module
4. Continue with remaining phases

## Support

For issues or questions:
- Supabase Docs: https://supabase.com/docs
- PostgreSQL Docs: https://postgresql.org/docs
