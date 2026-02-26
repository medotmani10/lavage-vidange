-- ============================================================
-- Lavage & Vidange ERP 2026
-- Row Level Security (RLS) Policies - KIOSK ACCESS
-- Supabase PostgreSQL
-- ============================================================
-- This script grants necessary permissions for the standalone
-- Kiosk application which connects anonymously (role anon).

-- Enable reading active services for Anon (Kiosk)
DROP POLICY IF EXISTS services_read_anon ON services;
CREATE POLICY services_read_anon ON services
  FOR SELECT
  USING (auth.role() = 'anon' OR auth.role() = 'authenticated');

-- Enable reading and creating queue_tickets for Anon (Kiosk)
DROP POLICY IF EXISTS queue_tickets_read_anon ON queue_tickets;
CREATE POLICY queue_tickets_read_anon ON queue_tickets
  FOR SELECT
  USING (auth.role() = 'anon' OR auth.role() = 'authenticated');

DROP POLICY IF EXISTS queue_tickets_insert_anon ON queue_tickets;
CREATE POLICY queue_tickets_insert_anon ON queue_tickets
  FOR INSERT
  WITH CHECK (auth.role() = 'anon' OR auth.role() = 'authenticated');

-- Enable reading and creating customers for Anon (Kiosk)
-- Kiosk needs to query customers by phone to check if they exist, and insert if they don't
DROP POLICY IF EXISTS customers_read_anon ON customers;
CREATE POLICY customers_read_anon ON customers
  FOR SELECT
  USING (auth.role() = 'anon' OR auth.role() = 'authenticated');

DROP POLICY IF EXISTS customers_insert_anon ON customers;
CREATE POLICY customers_insert_anon ON customers
  FOR INSERT
  WITH CHECK (auth.role() = 'anon' OR auth.role() = 'authenticated');

-- Enable creating vehicles for Anon (Kiosk) 
-- Kiosk inserts a placeholder vehicle using customer ID
DROP POLICY IF EXISTS vehicles_insert_anon ON vehicles;
CREATE POLICY vehicles_insert_anon ON vehicles
  FOR INSERT
  WITH CHECK (auth.role() = 'anon' OR auth.role() = 'authenticated');

-- Allow reading vehicles for anon
DROP POLICY IF EXISTS vehicles_read_anon ON vehicles;
CREATE POLICY vehicles_read_anon ON vehicles
  FOR SELECT
  USING (auth.role() = 'anon' OR auth.role() = 'authenticated');
