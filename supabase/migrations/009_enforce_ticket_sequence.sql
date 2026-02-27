-- ============================================================
-- 009: Race-safe sequential ticket numbering via counter table
-- ============================================================

-- 1. Clean up all old triggers and functions
DROP TRIGGER IF EXISTS before_insert_queue_ticket_force_sequence ON public.queue_tickets;
DROP TRIGGER IF EXISTS before_insert_queue_ticket ON public.queue_tickets;
DROP FUNCTION IF EXISTS public.generate_ticket_number();
DROP FUNCTION IF EXISTS public.enforce_daily_ticket_sequence();

-- 2. Create a dedicated atomic counter table (one row per day)
CREATE TABLE IF NOT EXISTS public.ticket_counters (
  counter_date DATE PRIMARY KEY,
  counter      INTEGER NOT NULL DEFAULT 0
);

-- Allow the trigger function (SECURITY DEFINER) to access this table
GRANT ALL ON public.ticket_counters TO postgres, service_role;

-- 3. The trigger function: uses INSERT ... ON CONFLICT DO UPDATE 
--    which is 100% atomic in PostgreSQL — no race condition possible.
CREATE OR REPLACE FUNCTION public.enforce_daily_ticket_sequence()
RETURNS TRIGGER AS $$
DECLARE
  v_seq INTEGER;
BEGIN
  -- Atomically increment or initialize today's counter
  INSERT INTO public.ticket_counters (counter_date, counter)
  VALUES (CURRENT_DATE, 1)
  ON CONFLICT (counter_date) DO UPDATE
    SET counter = ticket_counters.counter + 1
  RETURNING counter INTO v_seq;

  -- Format: K0001, K0002, ... K9999 (resets each midnight)
  NEW.ticket_number := 'K' || LPAD(v_seq::TEXT, 4, '0');

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Attach trigger to queue_tickets (fires on every INSERT)
CREATE TRIGGER before_insert_queue_ticket_force_sequence
  BEFORE INSERT ON public.queue_tickets
  FOR EACH ROW
  EXECUTE FUNCTION public.enforce_daily_ticket_sequence();

-- 5. Seed today's counter from existing tickets (so we don't re-use old numbers)
INSERT INTO public.ticket_counters (counter_date, counter)
SELECT CURRENT_DATE,
       COALESCE(MAX(CAST(SUBSTRING(ticket_number FROM 2) AS INTEGER)), 0)
  FROM public.queue_tickets
 WHERE created_at::date = CURRENT_DATE
   AND ticket_number ~ '^K[0-9]+$'
ON CONFLICT (counter_date) DO UPDATE
  SET counter = EXCLUDED.counter;
