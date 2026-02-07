-- Add paid_amount to jobs table to track partial payments
ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS paid_amount DECIMAL(10,2) DEFAULT 0;

-- Update existing paid jobs to have paid_amount equal to final_total
UPDATE public.jobs
SET paid_amount = COALESCE(final_total, estimated_cost, 0)
WHERE payment_status = 'paid';
