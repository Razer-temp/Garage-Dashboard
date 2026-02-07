import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Bike } from '@/types/database';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

export function useBikes(customerId?: string) {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['bikes', user?.id, customerId],
    queryFn: async () => {
      let query = supabase.from('bikes').select().eq('user_id', user?.id);

      if (customerId) {
        query = query.eq('customer_id', customerId);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;
      return data as Bike[];
    },
    enabled: !!user?.id,
  });
}

export function useBike(id: string) {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['bikes', user?.id, 'single', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('bikes')
        .select('*, customer:customers(*)')
        .eq('id', id)
        .eq('user_id', user?.id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!id && !!user?.id,
  });
}

export function useCreateBike() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (bike: Omit<Bike, 'id' | 'created_at' | 'updated_at' | 'user_id'>) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('bikes')
        .insert({ ...bike, user_id: user.id })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['bikes'] });
      queryClient.invalidateQueries({ queryKey: ['customers', data.customer_id] });
      toast.success('Bike added successfully');
    },
    onError: (error) => {
      toast.error('Failed to add bike: ' + error.message);
    },
  });
}

export function useUpdateBike() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Bike> & { id: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('bikes')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['bikes'] });
      queryClient.invalidateQueries({ queryKey: ['bikes', 'single', data.id] });
      queryClient.invalidateQueries({ queryKey: ['customers', data.customer_id] });
      toast.success('Bike updated successfully');
    },
    onError: (error) => {
      toast.error('Failed to update bike: ' + error.message);
    },
  });
}

export function useDeleteBike() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('bikes')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bikes'] });
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      toast.success('Bike deleted successfully');
    },
    onError: (error) => {
      toast.error('Failed to delete bike: ' + error.message);
    },
  });
}
