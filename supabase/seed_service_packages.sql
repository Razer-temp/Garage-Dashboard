-- Default Service Packages Seeding
-- Note: Replace 'ANY_USER_ID' with a real user ID if you want them to be owned by a specific admin,
-- or leave as null for system-wide (if RLS allows). 
-- This script assumes the first user in auth.users can be used as a placeholder if targetting a specific user.

DO $$
DECLARE
    v_user_id UUID;
    v_pkg_id UUID;
BEGIN
    -- Get the first user ID from auth.users (fallback)
    SELECT id INTO v_user_id FROM auth.users LIMIT 1;

    -- 1. BASIC SERVICE
    INSERT INTO public.service_packages (user_id, name, description, category, labor_charge, estimated_time, checklist_items)
    VALUES (v_user_id, 'Basic Service', 'Routine maintenance including oil change and chain adjustment.', 'Routine', 350, '45 min', 
    '["Engine Oil Change", "Oil Filter Cleaning", "Chain Lubrication", "Chain Adjustment", "Spark Plug Check", "Air Filter Check", "Brake Adjustment"]')
    RETURNING id INTO v_pkg_id;

    INSERT INTO public.service_package_items (package_id, item_name, quantity, unit_price)
    VALUES (v_pkg_id, 'Engine Oil (1L)', 1, 450);

    -- 2. FULL SERVICE
    INSERT INTO public.service_packages (user_id, name, description, category, labor_charge, estimated_time, checklist_items)
    VALUES (v_user_id, 'Full Service', 'Comprehensive service covering all major components.', 'Routine', 850, '3 hrs', 
    '["Engine Oil Change", "Oil Filter Replacement", "Air Filter Replacement", "Spark Plug Replacement", "Chain Cleaning & Lubing", "Carburetor/Throttle Body Cleaning", "Brake Pad Check", "Cable Lubing", "Battery Voltage Check", "Tire Pressure Check"]')
    RETURNING id INTO v_pkg_id;

    INSERT INTO public.service_package_items (package_id, item_name, quantity, unit_price)
    VALUES 
    (v_pkg_id, 'Engine Oil (1L)', 1, 450),
    (v_pkg_id, 'Oil Filter', 1, 120),
    (v_pkg_id, 'Air Filter', 1, 250),
    (v_pkg_id, 'Spark Plug', 1, 180);

    -- 3. FRONT BRAKE OVERHAUL
    INSERT INTO public.service_packages (user_id, name, description, category, labor_charge, estimated_time, checklist_items)
    VALUES (v_user_id, 'Front Brake Overhaul', 'Complete disc brake service including pad replacement and fluid bleed.', 'Brakes', 400, '1 hr', 
    '["Brake Pad Replacement", "Caliper Cleaning", "Brake Fluid Bleeding", "Master Cylinder Check"]')
    RETURNING id INTO v_pkg_id;

    INSERT INTO public.service_package_items (package_id, item_name, quantity, unit_price)
    VALUES 
    (v_pkg_id, 'Front Brake Pads', 1, 650),
    (v_pkg_id, 'Brake Fluid (100ml)', 1, 90);

    -- 4. CHAIN & SPROCKET REPLACEMENT
    INSERT INTO public.service_packages (user_id, name, description, category, labor_charge, estimated_time, checklist_items)
    VALUES (v_user_id, 'Chain & Sprocket Replacement', 'Replacing the drive chain and both sprockets.', 'Drive', 600, '1.5 hrs', 
    '["Chain Removal", "Sprocket Removal", "New Set Installation", "Alignment Check", "Chain Tensioning"]')
    RETURNING id INTO v_pkg_id;

    INSERT INTO public.service_package_items (package_id, item_name, quantity, unit_price)
    VALUES (v_pkg_id, 'Chain & Sprocket Kit', 1, 2400);

END $$;
