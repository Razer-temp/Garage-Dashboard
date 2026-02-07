-- Migration: Service Packages (Quick Job Templates)
-- Date: 2026-02-09

-- 1. Create Service Packages Table
CREATE TABLE IF NOT EXISTS public.service_packages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    category TEXT,
    labor_charge DECIMAL(10, 2) DEFAULT 0,
    gst_applicable BOOLEAN DEFAULT true,
    fixed_price DECIMAL(10, 2), -- Optional override for total
    estimated_time TEXT, -- e.g. "45 min"
    checklist_items JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 2. Create Service Package Items (Parts)
CREATE TABLE IF NOT EXISTS public.service_package_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    package_id UUID REFERENCES public.service_packages(id) ON DELETE CASCADE,
    inventory_item_id UUID REFERENCES public.inventory_items(id) ON DELETE SET NULL,
    item_name TEXT NOT NULL,
    quantity INTEGER DEFAULT 1,
    unit_price DECIMAL(10, 2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 3. Update Jobs table to track applied package
ALTER TABLE public.jobs 
ADD COLUMN IF NOT EXISTS applied_package_id UUID REFERENCES public.service_packages(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS applied_package_name TEXT;

-- 4. Enable RLS
ALTER TABLE public.service_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_package_items ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies
CREATE POLICY "Users can manage their own service packages"
    ON public.service_packages
    FOR ALL
    USING (auth.uid() = user_id);

CREATE POLICY "Users can manage items for their own packages"
    ON public.service_package_items
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.service_packages
            WHERE id = package_id AND user_id = auth.uid()
        )
    );

-- 6. Trigger for updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at
BEFORE UPDATE ON public.service_packages
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();
