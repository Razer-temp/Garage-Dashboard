-- Add invoicing fields to jobs table
ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS invoice_number TEXT;
ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS gst_percent DECIMAL(5,2) DEFAULT 0;
ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS gst_amount DECIMAL(10,2) DEFAULT 0;
ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS discount_amount DECIMAL(10,2) DEFAULT 0;
ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS is_invoice_generated BOOLEAN DEFAULT false;

-- Add index for invoice number
CREATE INDEX IF NOT EXISTS idx_jobs_invoice_number ON public.jobs(invoice_number);

-- Create a sequence for sequential invoice numbers per user if needed, 
-- but simpler is just a unique constraint or a global sequence.
-- Let's stick to a simple text field for now and generate it in the frontend/hook.
