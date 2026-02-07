import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { DashboardStats } from '@/types/database';

export function useDashboardStats() {
  return useQuery({
    queryKey: ['dashboard', 'stats'],
    queryFn: async () => {
      const today = new Date().toISOString().split('T')[0];
      const thirtyDaysFromNow = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

      const [customersResult, activeJobsResult, pendingPaymentsResult, remindersResult] = await Promise.all([
        supabase.from('customers').select('id', { count: 'exact', head: true }),
        supabase.from('jobs').select('id', { count: 'exact', head: true }).in('status', ['pending', 'in_progress']),
        supabase.from('jobs').select('id', { count: 'exact', head: true }).in('payment_status', ['pending', 'partial']),
        supabase
          .from('jobs')
          .select('id', { count: 'exact', head: true })
          .not('next_service_date', 'is', null)
          .gte('next_service_date', today)
          .lte('next_service_date', thirtyDaysFromNow),
      ]);

      return {
        totalCustomers: customersResult.count ?? 0,
        activeJobs: activeJobsResult.count ?? 0,
        pendingPayments: pendingPaymentsResult.count ?? 0,
        upcomingReminders: remindersResult.count ?? 0,
      } as DashboardStats;
    },
  });
}
