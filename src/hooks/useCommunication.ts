import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import {
    CommunicationTemplate,
    CommunicationTemplateInsert,
    CommunicationTemplateUpdate,
    CommunicationLog,
    CommunicationLogInsert
} from '@/types/database';
import { toast } from 'sonner';

export function useTemplates() {
    return useQuery({
        queryKey: ['communication-templates'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('communication_templates')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            return data as CommunicationTemplate[];
        },
    });
}

export function useCreateTemplate() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (template: CommunicationTemplateInsert) => {
            const { data, error } = await supabase
                .from('communication_templates')
                .insert(template)
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['communication-templates'] });
            toast.success('Template created successfully');
        },
        onError: (error: any) => {
            toast.error('Failed to create template: ' + error.message);
        },
    });
}

export function useUpdateTemplate() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, ...updates }: CommunicationTemplateUpdate & { id: string }) => {
            const { data, error } = await supabase
                .from('communication_templates')
                .update(updates)
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['communication-templates'] });
            toast.success('Template updated successfully');
        },
        onError: (error: any) => {
            toast.error('Failed to update template: ' + error.message);
        },
    });
}

export function useDeleteTemplate() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: string) => {
            const { error } = await supabase
                .from('communication_templates')
                .delete()
                .eq('id', id);

            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['communication-templates'] });
            toast.success('Template deleted successfully');
        },
        onError: (error: any) => {
            toast.error('Failed to delete template: ' + error.message);
        },
    });
}

export function useCommunicationLogs(customerId: string) {
    return useQuery({
        queryKey: ['communication-logs', customerId],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('communication_logs')
                .select('*')
                .eq('customer_id', customerId)
                .order('created_at', { ascending: false });

            if (error) throw error;
            return data as CommunicationLog[];
        },
    });
}

export function useLogCommunication() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (log: CommunicationLogInsert) => {
            const { data, error } = await supabase
                .from('communication_logs')
                .insert(log)
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['communication-logs', data.customer_id] });
        },
    });
}
