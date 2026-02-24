-- ============================================================
-- Lavage & Vidange ERP 2026
-- Database Schema Migration
-- Supabase PostgreSQL
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- 1. USERS & AUTHENTICATION
-- ============================================================

-- User roles enum
CREATE TYPE user_role AS ENUM ('admin', 'manager', 'cashier', 'worker');

-- Users table (extends Supabase auth.users)
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  role user_role NOT NULL DEFAULT 'worker',
  phone VARCHAR(50),
  avatar_url VARCHAR(500),
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for faster lookups
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_active ON users(active);

-- ============================================================
-- 2. CUSTOMERS
-- ============================================================

CREATE TABLE customers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  full_name VARCHAR(255) NOT NULL,
  phone VARCHAR(50) NOT NULL,
  email VARCHAR(255),
  address TEXT,
  credit_limit DECIMAL(12, 2) DEFAULT 0,
  current_balance DECIMAL(12, 2) DEFAULT 0,
  loyalty_points INTEGER DEFAULT 0,
  notes TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_customers_phone ON customers(phone);
CREATE INDEX idx_customers_email ON customers(email);
CREATE INDEX idx_customers_active ON customers(active);
CREATE INDEX idx_customers_balance ON customers(current_balance);

-- ============================================================
-- 3. VEHICLES
-- ============================================================

CREATE TABLE vehicles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  plate_number VARCHAR(50) NOT NULL,
  brand VARCHAR(100) NOT NULL,
  model VARCHAR(100) NOT NULL,
  year INTEGER NOT NULL,
  odometer INTEGER DEFAULT 0,
  vin VARCHAR(100),
  color VARCHAR(50),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_vehicles_customer_id ON vehicles(customer_id);
CREATE INDEX idx_vehicles_plate ON vehicles(plate_number);
CREATE INDEX idx_vehicles_brand ON vehicles(brand);

-- ============================================================
-- 4. SERVICES
-- ============================================================

CREATE TABLE services (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name_fr VARCHAR(255) NOT NULL,
  name_ar VARCHAR(255) NOT NULL,
  description_fr TEXT,
  description_ar TEXT,
  price DECIMAL(10, 2) NOT NULL DEFAULT 0,
  cost DECIMAL(10, 2) DEFAULT 0,
  duration_minutes INTEGER DEFAULT 30,
  commission_rate DECIMAL(5, 2) DEFAULT 0, -- Percentage (e.g., 10.00 = 10%)
  commission_fixed DECIMAL(10, 2) DEFAULT 0, -- Fixed amount alternative
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_services_active ON services(active);
CREATE INDEX idx_services_name_fr ON services(name_fr);
CREATE INDEX idx_services_name_ar ON services(name_ar);

-- ============================================================
-- 5. SUPPLIERS
-- ============================================================

CREATE TABLE suppliers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_name VARCHAR(255) NOT NULL,
  contact_person VARCHAR(255),
  phone VARCHAR(50) NOT NULL,
  email VARCHAR(255),
  address TEXT,
  tax_id VARCHAR(100),
  balance_owed DECIMAL(12, 2) DEFAULT 0,
  credit_limit DECIMAL(12, 2) DEFAULT 0,
  notes TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_suppliers_phone ON suppliers(phone);
CREATE INDEX idx_suppliers_email ON suppliers(email);
CREATE INDEX idx_suppliers_active ON suppliers(active);

-- ============================================================
-- 6. PRODUCTS (INVENTORY)
-- ============================================================

-- Product category enum
CREATE TYPE product_category AS ENUM ('tire', 'oil', 'accessory', 'service_package', 'other');

CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name_fr VARCHAR(255) NOT NULL,
  name_ar VARCHAR(255) NOT NULL,
  category product_category NOT NULL DEFAULT 'other',
  sku VARCHAR(100) UNIQUE NOT NULL,
  barcode VARCHAR(100),
  stock_quantity INTEGER NOT NULL DEFAULT 0,
  min_stock INTEGER NOT NULL DEFAULT 5,
  unit_price DECIMAL(10, 2) NOT NULL DEFAULT 0,
  cost_price DECIMAL(10, 2) NOT NULL DEFAULT 0,
  supplier_id UUID REFERENCES suppliers(id),

  -- Tire specific attributes
  tire_width INTEGER, -- e.g., 205
  tire_height INTEGER, -- e.g., 55
  tire_diameter INTEGER, -- e.g., 16

  -- Oil specific attributes
  oil_viscosity VARCHAR(20), -- e.g., "5W-30"
  oil_volume DECIMAL(8, 2), -- e.g., 5.00 (liters)

  -- General attributes
  brand VARCHAR(100),
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_products_sku ON products(sku);
CREATE INDEX idx_products_barcode ON products(barcode);
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_stock ON products(stock_quantity);
CREATE INDEX idx_products_supplier ON products(supplier_id);

-- ============================================================
-- 7. EMPLOYEES
-- ============================================================

CREATE TABLE employees (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  position VARCHAR(100) NOT NULL,
  phone VARCHAR(50) NOT NULL,
  emergency_contact VARCHAR(255),
  base_salary DECIMAL(10, 2) DEFAULT 0,
  commission_rate DECIMAL(5, 2) DEFAULT 0, -- Default commission percentage
  total_commissions DECIMAL(12, 2) DEFAULT 0,
  paid_commissions DECIMAL(12, 2) DEFAULT 0,
  pending_commissions DECIMAL(12, 2) DEFAULT 0,
  hire_date DATE,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_employees_user_id ON employees(user_id);
CREATE INDEX idx_employees_active ON employees(active);
CREATE INDEX idx_employees_position ON employees(position);

-- ============================================================
-- 8. ATTENDANCE
-- ============================================================

CREATE TABLE attendance (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  check_in TIMESTAMPTZ NOT NULL,
  check_out TIMESTAMPTZ,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_attendance_employee_id ON attendance(employee_id);
CREATE INDEX idx_attendance_date ON attendance(date);
CREATE INDEX idx_attendance_employee_date ON attendance(employee_id, date);

-- ============================================================
-- 9. QUEUE TICKETS
-- ============================================================

-- Ticket status enum
CREATE TYPE ticket_status AS ENUM ('pending', 'in_progress', 'completed', 'cancelled');

-- Ticket priority enum
CREATE TYPE ticket_priority AS ENUM ('normal', 'priority', 'vip');

-- Payment method enum
CREATE TYPE payment_method AS ENUM ('cash', 'card', 'credit', 'mixed');

CREATE TABLE queue_tickets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ticket_number VARCHAR(50) UNIQUE NOT NULL,
  customer_id UUID NOT NULL REFERENCES customers(id),
  vehicle_id UUID NOT NULL REFERENCES vehicles(id),
  
  -- Service details
  service_ids UUID[] DEFAULT '{}', -- Array of service IDs
  product_items JSONB DEFAULT '[]'::jsonb, -- [{product_id, quantity, unit_price}]
  
  -- Status & Priority
  status ticket_status NOT NULL DEFAULT 'pending',
  priority ticket_priority NOT NULL DEFAULT 'normal',
  
  -- Assignment
  assigned_employee_id UUID REFERENCES employees(id),
  
  -- Financial
  subtotal DECIMAL(12, 2) DEFAULT 0,
  tax_rate DECIMAL(5, 2) DEFAULT 0,
  tax_amount DECIMAL(12, 2) DEFAULT 0,
  discount DECIMAL(12, 2) DEFAULT 0,
  total_amount DECIMAL(12, 2) DEFAULT 0,
  paid_amount DECIMAL(12, 2) DEFAULT 0,
  payment_method payment_method,
  
  -- Notes
  notes TEXT,
  internal_notes TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  cancelled_reason TEXT
);

-- Indexes
CREATE INDEX idx_queue_tickets_number ON queue_tickets(ticket_number);
CREATE INDEX idx_queue_tickets_customer ON queue_tickets(customer_id);
CREATE INDEX idx_queue_tickets_vehicle ON queue_tickets(vehicle_id);
CREATE INDEX idx_queue_tickets_status ON queue_tickets(status);
CREATE INDEX idx_queue_tickets_priority ON queue_tickets(priority);
CREATE INDEX idx_queue_tickets_employee ON queue_tickets(assigned_employee_id);
CREATE INDEX idx_queue_tickets_created ON queue_tickets(created_at);

-- ============================================================
-- 10. TICKET SERVICES (Junction Table)
-- ============================================================

CREATE TABLE ticket_services (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ticket_id UUID NOT NULL REFERENCES queue_tickets(id) ON DELETE CASCADE,
  service_id UUID NOT NULL REFERENCES services(id),
  quantity INTEGER DEFAULT 1,
  unit_price DECIMAL(10, 2) NOT NULL,
  total_price DECIMAL(10, 2) NOT NULL,
  employee_id UUID REFERENCES employees(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_ticket_services_ticket ON ticket_services(ticket_id);
CREATE INDEX idx_ticket_services_service ON ticket_services(service_id);
CREATE INDEX idx_ticket_services_employee ON ticket_services(employee_id);

-- ============================================================
-- 11. TICKET PRODUCTS (Junction Table)
-- ============================================================

CREATE TABLE ticket_products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ticket_id UUID NOT NULL REFERENCES queue_tickets(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id),
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price DECIMAL(10, 2) NOT NULL,
  total_price DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_ticket_products_ticket ON ticket_products(ticket_id);
CREATE INDEX idx_ticket_products_product ON ticket_products(product_id);

-- ============================================================
-- 12. COMMISSIONS
-- ============================================================

CREATE TABLE commissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  ticket_id UUID NOT NULL REFERENCES queue_tickets(id),
  service_id UUID REFERENCES services(id),
  
  amount DECIMAL(10, 2) NOT NULL,
  calculation_method VARCHAR(50) DEFAULT 'percentage', -- 'percentage' or 'fixed'
  rate_applied DECIMAL(5, 2) DEFAULT 0,
  
  paid BOOLEAN DEFAULT false,
  paid_at TIMESTAMPTZ,
  paid_in_batch UUID, -- For batch payments
  
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_commissions_employee ON commissions(employee_id);
CREATE INDEX idx_commissions_ticket ON commissions(ticket_id);
CREATE INDEX idx_commissions_paid ON commissions(paid);
CREATE INDEX idx_commissions_created ON commissions(created_at);

-- ============================================================
-- 13. DEBTS / CREDIT
-- ============================================================

CREATE TYPE debt_status AS ENUM ('pending', 'partial', 'completed', 'cancelled');

CREATE TABLE debts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  ticket_id UUID REFERENCES queue_tickets(id),
  
  original_amount DECIMAL(12, 2) NOT NULL,
  paid_amount DECIMAL(12, 2) DEFAULT 0,
  remaining_amount DECIMAL(12, 2) NOT NULL,
  
  due_date DATE,
  status debt_status NOT NULL DEFAULT 'pending',
  
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_debts_customer ON debts(customer_id);
CREATE INDEX idx_debts_ticket ON debts(ticket_id);
CREATE INDEX idx_debts_status ON debts(status);
CREATE INDEX idx_debts_due_date ON debts(due_date);

-- ============================================================
-- 14. PAYMENTS
-- ============================================================

CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ticket_id UUID REFERENCES queue_tickets(id),
  debt_id UUID REFERENCES debts(id),
  customer_id UUID NOT NULL REFERENCES customers(id),
  
  amount DECIMAL(12, 2) NOT NULL,
  payment_method payment_method NOT NULL,
  reference_number VARCHAR(100), -- For card transactions, checks, etc.
  
  received_by UUID REFERENCES users(id),
  notes TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_payments_ticket ON payments(ticket_id);
CREATE INDEX idx_payments_debt ON payments(debt_id);
CREATE INDEX idx_payments_customer ON payments(customer_id);
CREATE INDEX idx_payments_created ON payments(created_at);

-- ============================================================
-- 15. PURCHASE INVOICES
-- ============================================================

CREATE TYPE invoice_status AS ENUM ('pending', 'partial', 'completed', 'cancelled');

CREATE TABLE purchase_invoices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  supplier_id UUID NOT NULL REFERENCES suppliers(id),
  invoice_number VARCHAR(100) NOT NULL,
  invoice_date DATE NOT NULL,
  
  items JSONB NOT NULL DEFAULT '[]'::jsonb, -- [{product_id, quantity, unit_cost, total}]
  
  subtotal DECIMAL(12, 2) DEFAULT 0,
  tax_amount DECIMAL(12, 2) DEFAULT 0,
  total_amount DECIMAL(12, 2) NOT NULL,
  paid_amount DECIMAL(12, 2) DEFAULT 0,
  remaining_amount DECIMAL(12, 2) DEFAULT 0,
  
  status invoice_status NOT NULL DEFAULT 'pending',
  
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_purchase_invoices_supplier ON purchase_invoices(supplier_id);
CREATE INDEX idx_purchase_invoices_number ON purchase_invoices(invoice_number);
CREATE INDEX idx_purchase_invoices_status ON purchase_invoices(status);
CREATE INDEX idx_purchase_invoices_date ON purchase_invoices(invoice_date);

-- ============================================================
-- 16. FINANCIAL TRANSACTIONS
-- ============================================================

CREATE TYPE transaction_type AS ENUM ('revenue', 'expense', 'transfer', 'adjustment');

CREATE TABLE financial_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type transaction_type NOT NULL,
  
  amount DECIMAL(12, 2) NOT NULL,
  
  description_fr TEXT NOT NULL,
  description_ar TEXT NOT NULL,
  
  reference_type VARCHAR(50), -- 'ticket', 'payment', 'invoice', 'commission', etc.
  reference_id UUID,
  
  category VARCHAR(100), -- For expense categorization
  
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_financial_transactions_type ON financial_transactions(type);
CREATE INDEX idx_financial_transactions_reference ON financial_transactions(reference_type, reference_id);
CREATE INDEX idx_financial_transactions_created ON financial_transactions(created_at);

-- ============================================================
-- 17. STOCK MOVEMENTS (AUDIT LOG)
-- ============================================================

CREATE TYPE movement_type AS ENUM ('in', 'out', 'adjustment', 'return', 'damage');

CREATE TABLE stock_movements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  
  movement_type movement_type NOT NULL,
  quantity INTEGER NOT NULL,
  unit_cost DECIMAL(10, 2),
  
  reference_type VARCHAR(50), -- 'purchase', 'ticket', 'adjustment'
  reference_id UUID,
  
  performed_by UUID REFERENCES users(id),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_stock_movements_product ON stock_movements(product_id);
CREATE INDEX idx_stock_movements_type ON stock_movements(movement_type);
CREATE INDEX idx_stock_movements_created ON stock_movements(created_at);

-- ============================================================
-- 18. LOYALTY TRANSACTIONS
-- ============================================================

CREATE TYPE loyalty_transaction_type AS ENUM ('earned', 'redeemed', 'adjusted', 'expired');

CREATE TABLE loyalty_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  ticket_id UUID REFERENCES queue_tickets(id),
  
  transaction_type loyalty_transaction_type NOT NULL,
  points INTEGER NOT NULL,
  balance_after INTEGER NOT NULL,
  
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_loyalty_transactions_customer ON loyalty_transactions(customer_id);
CREATE INDEX idx_loyalty_transactions_ticket ON loyalty_transactions(ticket_id);
CREATE INDEX idx_loyalty_transactions_type ON loyalty_transactions(transaction_type);

-- ============================================================
-- 19. DASHBOARD VIEWS (REAL-TIME)
-- ============================================================

-- Daily Revenue View
CREATE VIEW view_daily_revenue AS
SELECT 
  DATE(created_at) AS date,
  COUNT(*) AS ticket_count,
  SUM(total_amount) AS gross_revenue,
  SUM(paid_amount) AS collected_amount,
  SUM(total_amount - paid_amount) AS pending_amount
FROM queue_tickets
WHERE status != 'cancelled'
GROUP BY DATE(created_at)
ORDER BY date DESC;

-- Current Queue View
CREATE VIEW view_current_queue AS
SELECT 
  qt.id,
  qt.ticket_number,
  qt.status,
  qt.priority,
  c.full_name AS customer_name,
  c.phone AS customer_phone,
  v.plate_number,
  v.brand || ' ' || v.model AS vehicle_name,
  e.full_name AS employee_name,
  qt.total_amount,
  qt.paid_amount,
  qt.created_at,
  qt.started_at,
  EXTRACT(EPOCH FROM (NOW() - qt.created_at)) / 60 AS wait_time_minutes
FROM queue_tickets qt
JOIN customers c ON qt.customer_id = c.id
JOIN vehicles v ON qt.vehicle_id = v.id
LEFT JOIN employees emp ON qt.assigned_employee_id = emp.id
LEFT JOIN users e ON emp.user_id = e.id
WHERE qt.status IN ('pending', 'in_progress')
ORDER BY 
  CASE qt.priority 
    WHEN 'vip' THEN 1 
    WHEN 'priority' THEN 2 
    ELSE 3 
  END,
  qt.created_at ASC;

-- Low Stock Products View
CREATE VIEW view_low_stock_products AS
SELECT 
  id,
  name_fr,
  name_ar,
  category,
  sku,
  stock_quantity,
  min_stock,
  (min_stock - stock_quantity) AS shortage
FROM products
WHERE stock_quantity <= min_stock
  AND active = true
ORDER BY shortage DESC;

-- Employee Commissions Summary View
CREATE VIEW view_employee_commissions AS
SELECT 
  e.id AS employee_id,
  u.full_name,
  e.position,
  e.total_commissions,
  e.paid_commissions,
  e.pending_commissions,
  (e.total_commissions - e.paid_commissions) AS due_commissions
FROM employees e
JOIN users u ON e.user_id = u.id
WHERE e.active = true;

-- Customer Debts Summary View
CREATE VIEW view_customer_debts AS
SELECT 
  c.id AS customer_id,
  c.full_name,
  c.phone,
  c.credit_limit,
  c.current_balance,
  c.loyalty_points,
  COUNT(d.id) AS debt_count,
  SUM(d.remaining_amount) AS total_remaining
FROM customers c
LEFT JOIN debts d ON c.id = d.customer_id AND d.status IN ('pending', 'partial')
WHERE c.active = true
GROUP BY c.id, c.full_name, c.phone, c.credit_limit, c.current_balance, c.loyalty_points
HAVING SUM(d.remaining_amount) > 0 OR c.current_balance > 0;

-- Dashboard Stats View
CREATE VIEW view_dashboard_stats AS
SELECT
  -- Today's stats
  (SELECT COALESCE(SUM(total_amount), 0) FROM queue_tickets 
   WHERE DATE(created_at) = CURRENT_DATE AND status != 'cancelled') AS daily_revenue,
  
  (SELECT COUNT(*) FROM queue_tickets 
   WHERE DATE(created_at) = CURRENT_DATE AND status = 'completed') AS completed_today,
  
  (SELECT COUNT(*) FROM queue_tickets 
   WHERE status IN ('pending', 'in_progress')) AS current_queue_count,
  
  -- Pending debts
  (SELECT COALESCE(SUM(remaining_amount), 0) FROM debts 
   WHERE status IN ('pending', 'partial')) AS pending_debts,
  
  -- Low stock count
  (SELECT COUNT(*) FROM products 
   WHERE stock_quantity <= min_stock AND active = true) AS low_stock_count,
  
  -- Due commissions
  (SELECT COALESCE(SUM(pending_commissions), 0) FROM employees 
   WHERE active = true) AS due_commissions;

-- ============================================================
-- 20. TRIGGERS & FUNCTIONS
-- ============================================================

-- Function: Update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to tables with updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_vehicles_updated_at BEFORE UPDATE ON vehicles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_services_updated_at BEFORE UPDATE ON services
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_suppliers_updated_at BEFORE UPDATE ON suppliers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_employees_updated_at BEFORE UPDATE ON employees
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_debts_updated_at BEFORE UPDATE ON debts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_purchase_invoices_updated_at BEFORE UPDATE ON purchase_invoices
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function: Generate ticket number
CREATE OR REPLACE FUNCTION generate_ticket_number()
RETURNS TRIGGER AS $$
DECLARE
  date_prefix TEXT;
  sequence_num INTEGER;
BEGIN
  date_prefix := TO_CHAR(NEW.created_at, 'YYYYMMDD');
  
  SELECT COALESCE(MAX(
    CAST(SUBSTRING(ticket_number FROM (LENGTH(date_prefix) + 2)) AS INTEGER)
  ), 0) + 1 INTO sequence_num
  FROM queue_tickets
  WHERE ticket_number LIKE date_prefix || '-%';
  
  NEW.ticket_number := date_prefix || '-' || LPAD(sequence_num::TEXT, 4, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER before_insert_queue_ticket
  BEFORE INSERT ON queue_tickets
  FOR EACH ROW
  WHEN (NEW.ticket_number IS NULL)
  EXECUTE FUNCTION generate_ticket_number();

-- Function: Update ticket totals
CREATE OR REPLACE FUNCTION update_ticket_totals()
RETURNS TRIGGER AS $$
BEGIN
  NEW.subtotal := COALESCE(NEW.subtotal, 0);
  NEW.tax_rate := COALESCE(NEW.tax_rate, 0);
  NEW.discount := COALESCE(NEW.discount, 0);
  NEW.tax_amount := NEW.subtotal * (NEW.tax_rate / 100);
  NEW.total_amount := NEW.subtotal + NEW.tax_amount - NEW.discount;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER before_insert_update_ticket_totals
  BEFORE INSERT OR UPDATE ON queue_tickets
  FOR EACH ROW
  EXECUTE FUNCTION update_ticket_totals();

-- Function: Update stock on ticket completion
CREATE OR REPLACE FUNCTION update_stock_on_ticket_complete()
RETURNS TRIGGER AS $$
DECLARE
  item JSONB;
  product_record RECORD;
BEGIN
  -- Only process on status change to 'completed'
  IF OLD.status != 'completed' AND NEW.status = 'completed' THEN
    -- Decrease stock for each product in the ticket
    FOR item IN SELECT * FROM JSONB_ARRAY_ELEMENTS(NEW.product_items)
    LOOP
      SELECT id, stock_quantity INTO product_record
      FROM products
      WHERE id = (item->>'product_id')::UUID;
      
      IF FOUND THEN
        UPDATE products
        SET stock_quantity = stock_quantity - (item->>'quantity')::INTEGER
        WHERE id = product_record.id;
        
        -- Log stock movement
        INSERT INTO stock_movements (
          product_id, movement_type, quantity, 
          reference_type, reference_id, performed_by
        ) VALUES (
          product_record.id, 'out', 
          (item->>'quantity')::INTEGER,
          'ticket', NEW.id, NEW.assigned_employee_id
        );
      END IF;
    END LOOP;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER after_ticket_complete_update_stock
  AFTER UPDATE ON queue_tickets
  FOR EACH ROW
  EXECUTE FUNCTION update_stock_on_ticket_complete();

-- Function: Update customer balance on payment
CREATE OR REPLACE FUNCTION update_customer_balance_on_payment()
RETURNS TRIGGER AS $$
BEGIN
  -- Update customer balance
  UPDATE customers
  SET current_balance = current_balance - NEW.amount
  WHERE id = NEW.customer_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER after_payment_update_customer_balance
  AFTER INSERT ON payments
  FOR EACH ROW
  EXECUTE FUNCTION update_customer_balance_on_payment();

-- Function: Calculate and create commission
CREATE OR REPLACE FUNCTION create_commission_on_ticket_complete()
RETURNS TRIGGER AS $$
DECLARE
  emp_record RECORD;
  service_record RECORD;
  commission_amount DECIMAL(10, 2);
  service_id UUID;
BEGIN
  -- Only process on status change to 'completed'
  IF OLD.status != 'completed' AND NEW.status = 'completed' AND NEW.assigned_employee_id IS NOT NULL THEN
    -- Get employee info
    SELECT id, commission_rate INTO emp_record
    FROM employees
    WHERE id = NEW.assigned_employee_id;
    
    IF FOUND THEN
      -- Calculate commission based on ticket total
      commission_amount := NEW.total_amount * (emp_record.commission_rate / 100);
      
      -- Create commission record
      INSERT INTO commissions (
        employee_id, ticket_id, amount, 
        calculation_method, rate_applied
      ) VALUES (
        emp_record.id, NEW.id, commission_amount,
        'percentage', emp_record.commission_rate
      );
      
      -- Update employee pending commissions
      UPDATE employees
      SET pending_commissions = pending_commissions + commission_amount,
          total_commissions = total_commissions + commission_amount
      WHERE id = emp_record.id;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER after_ticket_complete_create_commission
  AFTER UPDATE ON queue_tickets
  FOR EACH ROW
  EXECUTE FUNCTION create_commission_on_ticket_complete();

-- Function: Update loyalty points
CREATE OR REPLACE FUNCTION update_loyalty_points_on_payment()
RETURNS TRIGGER AS $$
DECLARE
  points_earned INTEGER;
  points_rate INTEGER := 1; -- 1 point per currency unit
BEGIN
  -- Calculate points (1 point per 1 unit of currency)
  points_earned := FLOOR(NEW.amount)::INTEGER * points_rate;
  
  IF points_earned > 0 THEN
    -- Update customer points
    UPDATE customers
    SET loyalty_points = loyalty_points + points_earned
    WHERE id = NEW.customer_id;
    
    -- Log loyalty transaction
    INSERT INTO loyalty_transactions (
      customer_id, ticket_id, transaction_type,
      points, balance_after
    )
    SELECT 
      NEW.customer_id, 
      NEW.ticket_id, 
      'earned',
      points_earned,
      c.loyalty_points + points_earned
    FROM customers c
    WHERE c.id = NEW.customer_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER after_payment_update_loyalty_points
  AFTER INSERT ON payments
  FOR EACH ROW
  EXECUTE FUNCTION update_loyalty_points_on_payment();

-- ============================================================
-- 21. SEED DATA (Optional - for testing)
-- ============================================================

-- Insert default admin user (you should change the password via Supabase UI)
-- Note: This assumes you've created the user via Supabase Auth first
-- INSERT INTO users (email, full_name, role) VALUES 
--   ('admin@lavage-vida.com', 'Administrateur', 'admin');

-- Insert sample services
INSERT INTO services (name_fr, name_ar, price, duration_minutes, commission_rate) VALUES
  ('Lavage Complet', 'غسيل كامل', 1500, 30, 10),
  ('Vidange Moteur', 'تغيير زيت المحرك', 3500, 45, 15),
  ('Lavage + Vidange', 'غسيل + تغيير زيت', 4500, 60, 12),
  ('Équilibrage Roues', 'موازنة العجلات', 2000, 30, 10),
  ('Alignement 3D', 'محاذاة 3D', 3000, 45, 15),
  ('Climatisation', 'صيانة المكيف', 5000, 60, 20),
  ('Freins', 'صيانة الفرامل', 4000, 60, 15),
  ('Diagnostic', 'تشخيص الأعطال', 2500, 30, 10);

-- ============================================================
-- END OF MIGRATION
-- ============================================================
