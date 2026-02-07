-- Create enum for job status
CREATE TYPE public.job_status AS ENUM ('pending', 'in_progress', 'ready_for_delivery', 'delivered');

-- Create enum for payment status
CREATE TYPE public.payment_status AS ENUM ('pending', 'partial', 'paid');

-- Create customers table
CREATE TABLE public.customers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  whatsapp TEXT,
  address TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create bikes table
CREATE TABLE public.bikes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  registration_number TEXT NOT NULL,
  make_model TEXT NOT NULL,
  year INTEGER,
  color TEXT,
  engine_number TEXT,
  chassis_number TEXT,
  last_mileage INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create jobs table
CREATE TABLE public.jobs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  bike_id UUID NOT NULL REFERENCES public.bikes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date_in TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  date_out TIMESTAMP WITH TIME ZONE,
  problem_description TEXT NOT NULL,
  estimated_cost DECIMAL(10,2) DEFAULT 0,
  status public.job_status NOT NULL DEFAULT 'pending',
  parts_used TEXT,
  labor_cost DECIMAL(10,2) DEFAULT 0,
  final_total DECIMAL(10,2) DEFAULT 0,
  payment_status public.payment_status NOT NULL DEFAULT 'pending',
  mechanic_notes TEXT,
  next_service_date DATE,
  next_service_mileage INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bikes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;

-- RLS policies for customers
CREATE POLICY "Users can view their own customers" ON public.customers
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own customers" ON public.customers
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own customers" ON public.customers
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own customers" ON public.customers
  FOR DELETE USING (auth.uid() = user_id);

-- RLS policies for bikes (through customer ownership)
CREATE POLICY "Users can view bikes of their customers" ON public.bikes
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.customers 
      WHERE customers.id = bikes.customer_id 
      AND customers.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create bikes for their customers" ON public.bikes
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.customers 
      WHERE customers.id = bikes.customer_id 
      AND customers.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update bikes of their customers" ON public.bikes
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.customers 
      WHERE customers.id = bikes.customer_id 
      AND customers.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete bikes of their customers" ON public.bikes
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.customers 
      WHERE customers.id = bikes.customer_id 
      AND customers.user_id = auth.uid()
    )
  );

-- RLS policies for jobs
CREATE POLICY "Users can view their own jobs" ON public.jobs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own jobs" ON public.jobs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own jobs" ON public.jobs
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own jobs" ON public.jobs
  FOR DELETE USING (auth.uid() = user_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_customers_updated_at
  BEFORE UPDATE ON public.customers
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_bikes_updated_at
  BEFORE UPDATE ON public.bikes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_jobs_updated_at
  BEFORE UPDATE ON public.jobs
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_customers_user_id ON public.customers(user_id);
CREATE INDEX idx_customers_name ON public.customers(name);
CREATE INDEX idx_customers_phone ON public.customers(phone);
CREATE INDEX idx_bikes_customer_id ON public.bikes(customer_id);
CREATE INDEX idx_bikes_registration ON public.bikes(registration_number);
CREATE INDEX idx_jobs_bike_id ON public.jobs(bike_id);
CREATE INDEX idx_jobs_user_id ON public.jobs(user_id);
CREATE INDEX idx_jobs_status ON public.jobs(status);
CREATE INDEX idx_jobs_next_service_date ON public.jobs(next_service_date);