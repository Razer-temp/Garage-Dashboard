-- Add user_id to bikes table
ALTER TABLE public.bikes ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Update existing bikes to have the user_id of their customer
UPDATE public.bikes b
SET user_id = c.user_id
FROM public.customers c
WHERE b.customer_id = c.id;

-- Make user_id NOT NULL after update
ALTER TABLE public.bikes ALTER COLUMN user_id SET NOT NULL;

-- Enable RLS (already enabled, but let's be sure)
ALTER TABLE public.bikes ENABLE ROW LEVEL SECURITY;

-- Add RLS policy for user_id direct access
DROP POLICY IF EXISTS "Users can view bikes of their customers" ON public.bikes;
CREATE POLICY "Users can manage their own bikes" ON public.bikes
  FOR ALL USING (auth.uid() = user_id);

-- Add index
CREATE INDEX IF NOT EXISTS idx_bikes_user_id ON public.bikes(user_id);
