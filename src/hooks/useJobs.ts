import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Job, JobWithDetails, JobStatus, PaymentStatus, JobInsert, JobUpdate } from '@/types/database';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

export function useJobs(status?: JobStatus, paymentStatus?: PaymentStatus | PaymentStatus[]) {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['jobs', user?.id, status, paymentStatus],
    queryFn: async () => {
      let query = supabase
        .from('jobs')
        .select(`
          *,
          bike:bikes(
            *,
            customer:customers(*)
          )
        `)
        .order('created_at', { ascending: false });

      if (status) {
        query = query.eq('status', status);
      }

      if (paymentStatus) {
        if (Array.isArray(paymentStatus)) {
          query = query.in('payment_status', paymentStatus);
        } else {
          query = query.eq('payment_status', paymentStatus);
        }
      }

      if (user?.id) {
        query = query.eq('user_id', user.id);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as JobWithDetails[];
    },
    enabled: !!user?.id,
  });
}

export function useJob(id: string) {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['jobs', user?.id, id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('jobs')
        .select(`
          *,
          bike:bikes(
            *,
            customer:customers(*)
          )
        `)
        .eq('id', id)
        .eq('user_id', user?.id)
        .single();

      if (error) throw error;
      return data as JobWithDetails;
    },
    enabled: !!id && !!user?.id,
  });
}

export function useJobsByBike(bikeId: string) {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['jobs', user?.id, 'bike', bikeId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .eq('bike_id', bikeId)
        .eq('user_id', user?.id)
        .order('date_in', { ascending: false });

      if (error) throw error;
      return data as Job[];
    },
    enabled: !!bikeId && !!user?.id,
  });
}

export function useCreateJob() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (job: JobInsert) => {
      const { data, error } = await supabase
        .from('jobs')
        .insert(job)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      toast.success('Job created successfully');
    },
    onError: (error) => {
      toast.error('Failed to create job: ' + error.message);
    },
  });
}

export function useUpdateJob() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: JobUpdate & { id: string }) => {
      const { data, error } = await supabase
        .from('jobs')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      queryClient.invalidateQueries({ queryKey: ['jobs', data.id] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      toast.success('Job updated successfully');
    },
    onError: (error) => {
      toast.error('Failed to update job: ' + error.message);
    },
  });
}

export function useDeleteJob() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('jobs')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      toast.success('Job deleted successfully');
    },
    onError: (error) => {
      toast.error('Failed to delete job: ' + error.message);
    },
  });
}

export function useUpcomingReminders() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['reminders', user?.id],
    queryFn: async () => {
      const today = new Date().toISOString().split('T')[0];
      const thirtyDaysFromNow = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

      const { data, error } = await supabase
        .from('jobs')
        .select(`
          *,
          bike:bikes(
            *,
            customer:customers(*)
          )
        `)
        .not('next_service_date', 'is', null)
        .gte('next_service_date', today)
        .lte('next_service_date', thirtyDaysFromNow)
        .eq('user_id', user?.id)
        .order('next_service_date', { ascending: true });

      if (error) throw error;
      return data as JobWithDetails[];
    },
    enabled: !!user?.id,
  });
}
export function useGenerateInvoice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      // 1. Get the latest invoice number to generate the next one
      const { data: latestJob, error: fetchError } = await supabase
        .from('jobs')
        .select('invoice_number')
        .not('invoice_number', 'is', null)
        .order('invoice_number', { ascending: false })
        .limit(1);

      if (fetchError) throw fetchError;

      let nextNumber = 1;
      if (latestJob && latestJob.length > 0 && latestJob[0].invoice_number) {
        const match = latestJob[0].invoice_number.match(/INV-(\d+)/);
        if (match) {
          nextNumber = parseInt(match[1]) + 1;
        }
      }

      const invoice_number = `INV-${nextNumber.toString().padStart(4, '0')}`;

      // 2. Update the job
      const { data, error } = await supabase
        .from('jobs')
        .update({
          invoice_number,
          is_invoice_generated: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['jobs', data.id] });
      toast.success('Invoice generated successfully');
    },
    onError: (error) => {
      toast.error('Failed to generate invoice: ' + error.message);
    },
  });
}
