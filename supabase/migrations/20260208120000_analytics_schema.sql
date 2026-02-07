-- Migration to support Reports & Analytics (Inventory, Payment Methods)

-- 1. Create Payment Method Enum type
-- (Wrapping in DO block to avoid error if type already exists)
DO $$ BEGIN
    CREATE TYPE public.payment_method AS ENUM ('cash', 'upi', 'credit_card', 'debit_card', 'bank_transfer');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. Add payment_method to jobs table
ALTER TABLE public.jobs 
ADD COLUMN IF NOT EXISTS payment_method public.payment_method DEFAULT 'cash';

-- 3. Create Inventory Items Table
CREATE TABLE IF NOT EXISTS public.inventory_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  code TEXT, -- specific part code/SKU
  description TEXT,
  stock_quantity INTEGER DEFAULT 0,
  min_stock_level INTEGER DEFAULT 5,
  cost_price DECIMAL(10, 2) DEFAULT 0,
  selling_price DECIMAL(10, 2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 4. Create Job Parts Table (Linking Jobs to Inventory)
CREATE TABLE IF NOT EXISTS public.job_parts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  job_id UUID REFERENCES public.jobs(id) ON DELETE CASCADE,
  inventory_item_id UUID REFERENCES public.inventory_items(id) ON DELETE SET NULL,
  item_name TEXT NOT NULL, -- Snapshot of name in case inventory is deleted
  quantity INTEGER DEFAULT 1,
  unit_price DECIMAL(10, 2) DEFAULT 0, -- Snapshot of price at time of usage
  total_price DECIMAL(10, 2) GENERATED ALWAYS AS (quantity * unit_price) STORED,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 5. Security (RLS)
ALTER TABLE public.inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_parts ENABLE ROW LEVEL SECURITY;

-- Clean up existing policies if they exist to avoid errors on re-run
DROP POLICY IF EXISTS "Users can manage their own inventory" ON public.inventory_items;
DROP POLICY IF EXISTS "Users can manage their own job parts" ON public.job_parts;

CREATE POLICY "Users can manage their own inventory" ON public.inventory_items FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own job parts" ON public.job_parts FOR ALL USING (auth.uid() = user_id);
