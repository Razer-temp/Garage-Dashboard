import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import {
    ServicePackage,
    ServicePackageInsert,
    ServicePackageUpdate,
    ServicePackageWithItems,
    ServicePackageItemInsert
} from '@/types/database';
import { toast } from 'sonner';

export function useServicePackages() {
    return useQuery({
        queryKey: ['service-packages'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('service_packages')
                .select('*, items:service_package_items(*)')
                .order('name', { ascending: true });

            if (error) throw error;
            return data as ServicePackageWithItems[];
        },
    });
}

export function useServicePackage(id: string | null) {
    return useQuery({
        queryKey: ['service-package', id],
        queryFn: async () => {
            if (!id) return null;
            const { data, error } = await supabase
                .from('service_packages')
                .select('*, items:service_package_items(*)')
                .eq('id', id)
                .single();

            if (error) throw error;
            return data as ServicePackageWithItems;
        },
        enabled: !!id,
    });
}

export function useCreateServicePackage() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ package: pkg, items }: { package: ServicePackageInsert, items: ServicePackageItemInsert[] }) => {
            // 1. Create the package
            const { data: pkgData, error: pkgError } = await supabase
                .from('service_packages')
                .insert(pkg)
                .select()
                .single();

            if (pkgError) throw pkgError;

            // 2. Create the items (parts) if any
            if (items.length > 0) {
                const itemsToInsert = items.map(item => ({
                    ...item,
                    package_id: pkgData.id
                }));
                const { error: itemsError } = await supabase
                    .from('service_package_items')
                    .insert(itemsToInsert);

                if (itemsError) throw itemsError;
            }

            return pkgData;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['service-packages'] });
            toast.success('Service package created successfully');
        },
        onError: (error: any) => {
            toast.error('Failed to create service package: ' + error.message);
        },
    });
}

export function useUpdateServicePackage() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, package: updates, items }: { id: string, package: ServicePackageUpdate, items: ServicePackageItemInsert[] }) => {
            // 1. Update the package
            const { error: pkgError } = await supabase
                .from('service_packages')
                .update(updates)
                .eq('id', id);

            if (pkgError) throw pkgError;

            // 2. Clear old items and insert new ones (simplest approach for sync)
            const { error: deleteError } = await supabase
                .from('service_package_items')
                .delete()
                .eq('package_id', id);

            if (deleteError) throw deleteError;

            if (items.length > 0) {
                const itemsToInsert = items.map(item => ({
                    ...item,
                    package_id: id
                }));
                const { error: itemsError } = await supabase
                    .from('service_package_items')
                    .insert(itemsToInsert);

                if (itemsError) throw itemsError;
            }

            return { id };
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['service-packages'] });
            queryClient.invalidateQueries({ queryKey: ['service-package', data.id] });
            toast.success('Service package updated successfully');
        },
        onError: (error: any) => {
            toast.error('Failed to update service package: ' + error.message);
        },
    });
}

export function useDeleteServicePackage() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: string) => {
            const { error } = await supabase
                .from('service_packages')
                .delete()
                .eq('id', id);

            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['service-packages'] });
            toast.success('Service package deleted successfully');
        },
        onError: (error: any) => {
            toast.error('Failed to delete service package: ' + error.message);
        },
    });
}
