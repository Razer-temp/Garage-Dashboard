import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { JobPartInsert, JobPartUpdate } from '@/types/database';
import { useAuth } from '@/contexts/AuthContext';

export function useJobParts(jobId: string) {
    const { user } = useAuth();
    return useQuery({
        queryKey: ['job_parts', jobId, user?.id],
        queryFn: async () => {
            if (!jobId || !user?.id) return [];
            const { data, error } = await supabase
                .from('job_parts')
                .select('*')
                .eq('job_id', jobId)
                .eq('user_id', user.id)
                .order('created_at', { ascending: true });

            if (error) throw error;
            return data;
        },
        enabled: !!jobId && !!user?.id,
    });
}

export function useAddJobPart() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (part: JobPartInsert) => {
            const { data, error } = await supabase
                .from('job_parts')
                .insert(part)
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['job_parts', variables.job_id] });
            queryClient.invalidateQueries({ queryKey: ['inventory'] });
        },
    });
}

export function useUpdateJobPart() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, ...updates }: JobPartUpdate & { id: string }) => {
            const { data, error } = await supabase
                .from('job_parts')
                .update(updates)
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['job_parts', data.job_id] });
            queryClient.invalidateQueries({ queryKey: ['inventory'] });
        },
    });
}

export function useDeleteJobPart() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, job_id }: { id: string; job_id: string }) => {
            const { error } = await supabase
                .from('job_parts')
                .delete()
                .eq('id', id);

            if (error) throw error;
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['job_parts', variables.job_id] });
            queryClient.invalidateQueries({ queryKey: ['inventory'] });
        },
    });
}

export function useSyncJobParts() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ jobId, parts, userId }: { jobId: string; parts: Partial<JobPartInsert>[]; userId: string }) => {
            // 1. Delete existing parts for this job to "sync" (or perform complex diff)
            // For simplicity in this implementation, we replace the set.
            // Note: Trigger will handle adding stock back on delete and subtracting on insert.

            const { error: deleteError } = await supabase
                .from('job_parts')
                .delete()
                .eq('job_id', jobId);

            if (deleteError) throw deleteError;

            if (parts.length === 0) return [];

            const partsToInsert = parts.map(p => ({
                ...p,
                job_id: jobId,
                user_id: userId,
                item_name: p.item_name || 'Unknown Part'
            }));

            const { data, error: insertError } = await supabase
                .from('job_parts')
                .insert(partsToInsert as JobPartInsert[])
                .select();

            if (insertError) throw insertError;
            return data;
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['job_parts', variables.jobId] });
            queryClient.invalidateQueries({ queryKey: ['inventory'] });
        },
    });
}
