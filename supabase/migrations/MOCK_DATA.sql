-- ============================================================
-- MOCK DATA SCRIPT V5 (FINAL & TESTED): Lavage & Vidange VIDA
-- متوافق 100% مع الجداول الفعلية لقاعدة البيانات الحالية.
-- ============================================================

DO $$
DECLARE
    v_user_admin_id UUID;
    v_employee_id UUID;
    v_srv_lavage_simple UUID;
    v_srv_lavage_complet UUID;
    v_srv_vidange_moteur UUID;
    v_prod_huile_5w40 UUID;
    v_prod_filtre_huile UUID;
    v_prod_parfum UUID;
    v_cust_ahmed UUID;
    v_cust_fatima UUID;
    v_cust_youssef UUID;
    v_veh_ahmed_1 UUID;
    v_veh_fatima_1 UUID;
    v_veh_youssef_1 UUID;
    v_veh_youssef_2 UUID;
    v_ticket_1 UUID;
    v_ticket_2 UUID;
    v_ticket_3 UUID;
    v_ticket_4 UUID;
    v_debt_youssef UUID;
BEGIN
    -- أخذ حساب لاستخدامه وتأكيد وجوده كـ Employee
    SELECT id INTO v_user_admin_id FROM public.users LIMIT 1;
    IF v_user_admin_id IS NULL THEN RETURN; END IF;

    -- إضافة الموظف المرتبط بهذة الحساب (إذا لم يكن موجوداً) للتمكن من تخصيص العمال
    SELECT id INTO v_employee_id FROM public.employees WHERE user_id = v_user_admin_id LIMIT 1;
    IF v_employee_id IS NULL THEN
        INSERT INTO public.employees (user_id, position, phone, active) 
        VALUES (v_user_admin_id, 'Manager', '0000000000', true) RETURNING id INTO v_employee_id;
    END IF;

    -- 1. الخدمات (name, description, price, duration_minutes, active)
    INSERT INTO public.services (name, description, price, duration_minutes, active) VALUES
    ('Lavage Simple (Extérieur)', 'Nettoyage carrosserie et vitres', 800, 20, true) RETURNING id INTO v_srv_lavage_simple;
    INSERT INTO public.services (name, description, price, duration_minutes, active) VALUES
    ('Lavage Complet', 'Nettoyage complet int/ext', 1500, 45, true) RETURNING id INTO v_srv_lavage_complet;
    INSERT INTO public.services (name, description, price, duration_minutes, active) VALUES
    ('Main d''œuvre Vidange', 'Changement d''huile moteur', 1000, 30, true) RETURNING id INTO v_srv_vidange_moteur;

    -- 2. المنتجات (name, category, sku, barcode, cost_price, unit_price, stock_quantity, min_stock, brand, active)
    INSERT INTO public.products (name, category, sku, barcode, cost_price, unit_price, stock_quantity, min_stock, brand, active) VALUES
    ('Huile Moteur 5W40 (5L)', 'oil', 'OIL-5W40-01', '3001234567890', 3500, 4500, 50, 10, 'Total', true) RETURNING id INTO v_prod_huile_5w40;
    INSERT INTO public.products (name, category, sku, barcode, cost_price, unit_price, stock_quantity, min_stock, brand, active) VALUES
    ('Filtre à Huile Standard', 'accessory', 'FLT-OIL-01', '3009876543210', 500, 800, 30, 5, 'Bosch', true) RETURNING id INTO v_prod_filtre_huile;
    INSERT INTO public.products (name, category, sku, barcode, cost_price, unit_price, stock_quantity, min_stock, brand, active) VALUES
    ('Parfum Voiture Vanille', 'accessory', 'PRF-VAN-01', '3005556667770', 150, 300, 100, 20, 'Areon', true) RETURNING id INTO v_prod_parfum;

    -- 3. الزبائن (full_name, phone, email, current_balance, loyalty_points, active, notes)
    INSERT INTO public.customers (full_name, phone, email, current_balance, loyalty_points, active, notes) VALUES
    ('Ahmed Benali', '0555001122', 'ahmed@email.com', 0, 1500, true, 'Client régulier') RETURNING id INTO v_cust_ahmed;
    INSERT INTO public.customers (full_name, phone, email, current_balance, loyalty_points, active, notes) VALUES
    ('Fatima Zohra', '0666334455', 'fatima@email.com', 0, 500, true, null) RETURNING id INTO v_cust_fatima;
    INSERT INTO public.customers (full_name, phone, email, current_balance, loyalty_points, active, notes) VALUES
    ('Youssef Mansouri', '0777889900', 'youssef@email.com', 2000, 2500, true, 'Client VIP') RETURNING id INTO v_cust_youssef;

    -- 4. السيارات (customer_id, plate_number, brand, model, type, color, year, notes)
    INSERT INTO public.vehicles (customer_id, plate_number, brand, model, type, color, year, notes) VALUES
    (v_cust_ahmed, '12345-121-16', 'Peugeot', '208', 'sedan', 'Blanc', 2021, 'Rayure porte droite') RETURNING id INTO v_veh_ahmed_1;
    INSERT INTO public.vehicles (customer_id, plate_number, brand, model, type, color, year, notes) VALUES
    (v_cust_fatima, '98765-119-16', 'Renault', 'Clio 4', 'sedan', 'Rouge', 2019, null) RETURNING id INTO v_veh_fatima_1;
    INSERT INTO public.vehicles (customer_id, plate_number, brand, model, type, color, year, notes) VALUES
    (v_cust_youssef, '55555-123-16', 'Volkswagen', 'Golf 8', 'sedan', 'Noir', 2023, null) RETURNING id INTO v_veh_youssef_1;
    INSERT INTO public.vehicles (customer_id, plate_number, brand, model, type, color, year, notes) VALUES
    (v_cust_youssef, '44332-115-16', 'Dacia', 'Logan', 'sedan', 'Gris', 2015, 'Voiture de travail') RETURNING id INTO v_veh_youssef_2;

    -- التذاكر والمبيعات (قراءة جدول queue_tickets والجداول الفرعية ticket_services + ticket_products)
    
    -- الفاتورة الأولى 
    INSERT INTO public.queue_tickets (customer_id, vehicle_id, ticket_number, status, priority, assigned_employee_id, subtotal, total_amount, paid_amount, payment_method, created_at, started_at, completed_at) VALUES
    (v_cust_ahmed, v_veh_ahmed_1, 'T-0001', 'completed', 'normal', v_employee_id, 1500, 1500, 1500, 'cash', NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days' + INTERVAL '10 minutes', NOW() - INTERVAL '2 days' + INTERVAL '55 minutes') RETURNING id INTO v_ticket_1;
    INSERT INTO public.ticket_services (ticket_id, service_id, quantity, unit_price, total_price, employee_id) VALUES (v_ticket_1, v_srv_lavage_complet, 1, 1500, 1500, v_employee_id);
    INSERT INTO public.payments (ticket_id, customer_id, amount, payment_method, status, handled_by_id, created_at) VALUES (v_ticket_1, v_cust_ahmed, 1500, 'cash', 'completed', v_user_admin_id, NOW() - INTERVAL '2 days' + INTERVAL '55 minutes');

    -- الفاتورة الثانية
    INSERT INTO public.queue_tickets (customer_id, vehicle_id, ticket_number, status, priority, assigned_employee_id, subtotal, total_amount, paid_amount, payment_method, created_at, started_at, completed_at) VALUES
    (v_cust_fatima, v_veh_fatima_1, 'T-0002', 'completed', 'priority', v_employee_id, 6300, 6300, 6300, 'card', NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day' + INTERVAL '5 minutes', NOW() - INTERVAL '1 day' + INTERVAL '40 minutes') RETURNING id INTO v_ticket_2;
    INSERT INTO public.ticket_services (ticket_id, service_id, quantity, unit_price, total_price, employee_id) VALUES (v_ticket_2, v_srv_vidange_moteur, 1, 1000, 1000, v_employee_id);
    INSERT INTO public.ticket_products (ticket_id, product_id, quantity, unit_price, total_price) VALUES (v_ticket_2, v_prod_huile_5w40, 1, 4500, 4500);
    INSERT INTO public.ticket_products (ticket_id, product_id, quantity, unit_price, total_price) VALUES (v_ticket_2, v_prod_filtre_huile, 1, 800, 800);
    INSERT INTO public.payments (ticket_id, customer_id, amount, payment_method, status, handled_by_id, created_at) VALUES (v_ticket_2, v_cust_fatima, 6300, 'card', 'completed', v_user_admin_id, NOW() - INTERVAL '1 day' + INTERVAL '40 minutes');
    UPDATE public.products SET stock_quantity = stock_quantity - 1 WHERE id IN (v_prod_huile_5w40, v_prod_filtre_huile);

    -- الفاتورة الثالثة (دين)
    INSERT INTO public.queue_tickets (customer_id, vehicle_id, ticket_number, status, priority, assigned_employee_id, subtotal, total_amount, paid_amount, payment_method, created_at, started_at, completed_at) VALUES
    (v_cust_youssef, v_veh_youssef_1, 'T-0003', 'completed', 'vip', v_employee_id, 2000, 2000, 0, null, NOW() - INTERVAL '5 hours', NOW() - INTERVAL '4 hours 50 minutes', NOW() - INTERVAL '4 hours') RETURNING id INTO v_ticket_3;
    INSERT INTO public.ticket_services (ticket_id, service_id, quantity, unit_price, total_price, employee_id) VALUES (v_ticket_3, v_srv_lavage_complet, 1, 1500, 1500, v_employee_id);
    INSERT INTO public.ticket_products (ticket_id, product_id, quantity, unit_price, total_price) VALUES (v_ticket_3, v_prod_parfum, 1, 500, 500);
    INSERT INTO public.debts (customer_id, ticket_id, original_amount, remaining_amount, paid_amount, status, due_date, created_at) VALUES (v_cust_youssef, v_ticket_3, 2000, 2000, 0, 'pending', NOW() + INTERVAL '7 days', NOW() - INTERVAL '4 hours') RETURNING id INTO v_debt_youssef;
    UPDATE public.products SET stock_quantity = stock_quantity - 1 WHERE id = v_prod_parfum;

    -- الفاتورة الرابعة (في الانتظار / الغسيل)
    INSERT INTO public.queue_tickets (customer_id, vehicle_id, ticket_number, status, priority, assigned_employee_id, subtotal, total_amount, paid_amount, payment_method, created_at, started_at) VALUES
    (v_cust_ahmed, v_veh_ahmed_1, 'T-0004', 'in_progress', 'normal', v_employee_id, 800, 800, 0, null, NOW() - INTERVAL '15 minutes', NOW() - INTERVAL '2 minutes') RETURNING id INTO v_ticket_4;
    INSERT INTO public.ticket_services (ticket_id, service_id, quantity, unit_price, total_price, employee_id) VALUES (v_ticket_4, v_srv_lavage_simple, 1, 800, 800, v_employee_id);
END $$;
