-- Create garage_settings table
CREATE TABLE IF NOT EXISTS public.garage_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT 'MechanicPro Garage',
  address TEXT NOT NULL DEFAULT '123 Service Lane, Auto Hub, Pune, Maharashtra - 411001',
  gstin TEXT,
  phone TEXT NOT NULL DEFAULT '+91 98765 43210',
  email TEXT NOT NULL DEFAULT 'info@mechanicpro.com',
  website TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  CONSTRAINT unique_user_settings UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE public.garage_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policy
CREATE POLICY "Users can manage their own garage settings" 
ON public.garage_settings 
FOR ALL 
USING (auth.uid() = user_id);

-- Function to handle updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for updated_at
CREATE TRIGGER update_garage_settings_updated_at
BEFORE UPDATE ON public.garage_settings
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();
