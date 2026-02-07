import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { InventoryItem, InventoryItemInsert, InventoryItemUpdate } from '@/types/database';
import { toast } from 'sonner';

export function useInventory() {
    return useQuery({
        queryKey: ['inventory'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('inventory_items')
                .select('*')
                .order('name', { ascending: true });

            if (error) throw error;
            return data as InventoryItem[];
        },
    });
}

export function useCreateInventoryItem() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (item: InventoryItemInsert) => {
            const { data, error } = await supabase
                .from('inventory_items')
                .insert(item)
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['inventory'] });
            toast.success('Inventory item created successfully');
        },
        onError: (error: any) => {
            toast.error('Failed to create inventory item: ' + error.message);
        },
    });
}

export function useUpdateInventoryItem() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, ...updates }: InventoryItemUpdate & { id: string }) => {
            const { data, error } = await supabase
                .from('inventory_items')
                .update(updates)
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['inventory'] });
            toast.success('Inventory item updated successfully');
        },
        onError: (error: any) => {
            toast.error('Failed to update inventory item: ' + error.message);
        },
    });
}

export function useDeleteInventoryItem() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: string) => {
            const { error } = await supabase
                .from('inventory_items')
                .delete()
                .eq('id', id);

            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['inventory'] });
            toast.success('Inventory item deleted successfully');
        },
        onError: (error: any) => {
            toast.error('Failed to delete inventory item: ' + error.message);
        },
    });
}
