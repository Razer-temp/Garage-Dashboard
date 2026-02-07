import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { GarageSettings, GarageSettingsUpdate } from '@/types/database';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

export function useSettings() {
    const { user } = useAuth();
    return useQuery({
        queryKey: ['garage-settings', user?.id],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('garage_settings')
                .select('*')
                .eq('user_id', user?.id)
                .single();

            if (error) {
                if (error.code === 'PGRST116') {
                    // No settings found, return default-like object or null
                    return null;
                }
                throw error;
            }
            return data as GarageSettings;
        },
        enabled: !!user?.id,
    });
}

export function useUpdateSettings() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (updates: GarageSettingsUpdate) => {
            // Get current user
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('Not authenticated');

            // Check if settings exist
            const { data: existing } = await supabase
                .from('garage_settings')
                .select('id')
                .single();

            let error;
            if (existing) {
                const { error: updateError } = await supabase
                    .from('garage_settings')
                    .update(updates)
                    .eq('id', existing.id);
                error = updateError;
            } else {
                const { error: insertError } = await supabase
                    .from('garage_settings')
                    .insert({ ...updates, user_id: user.id } as any);
                error = insertError;
            }

            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['garage-settings'] });
            toast.success('Garage settings updated successfully');
        },
        onError: (error: any) => {
            toast.error('Failed to update settings: ' + error.message);
        },
    });
}
