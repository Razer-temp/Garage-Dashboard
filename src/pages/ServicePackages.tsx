import { useState } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Search, Boxes, Edit2, Trash2, Copy, Clock, BadgeCheck } from 'lucide-react';
import {
    useServicePackages,
    useDeleteServicePackage,
    useCreateServicePackage,
    useUpdateServicePackage
} from '@/hooks/useServicePackages';
import { Skeleton } from '@/components/ui/skeleton';
import ServicePackageForm from '@/components/ServicePackageForm';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { useAuth } from '@/contexts/AuthContext';
import { ServicePackageWithItems, ServicePackageInsert, ServicePackageItemInsert } from '@/types/database';

export default function ServicePackages() {
    const { user } = useAuth();
    const { data: packages, isLoading } = useServicePackages();
    const [search, setSearch] = useState('');
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingPackage, setEditingPackage] = useState<ServicePackageWithItems | undefined>();
    const [formTitle, setFormTitle] = useState('Create Service Package');

    const createPackage = useCreateServicePackage();
    const updatePackage = useUpdateServicePackage();
    const deletePackage = useDeleteServicePackage();

    const filteredPackages = packages?.filter(pkg =>
        pkg.name.toLowerCase().includes(search.toLowerCase()) ||
        pkg.description?.toLowerCase().includes(search.toLowerCase()) ||
        pkg.category?.toLowerCase().includes(search.toLowerCase())
    ) || [];

    const handleCreate = () => {
        setEditingPackage(undefined);
        setFormTitle('Create Service Package');
        setIsFormOpen(true);
    };

    const handleEdit = (pkg: ServicePackageWithItems) => {
        setEditingPackage(pkg);
        setFormTitle('Edit Service Package');
        setIsFormOpen(true);
    };

    const handleDuplicate = (pkg: ServicePackageWithItems) => {
        setEditingPackage({
            ...pkg,
            id: '', // Clear ID for new package
            name: `${pkg.name} (Copy)`
        });
        setFormTitle('Duplicate Service Package');
        setIsFormOpen(true);
    };

    const handleDelete = () => {
        if (deleteId) {
            deletePackage.mutate(deleteId, {
                onSuccess: () => setDeleteId(null)
            });
        }
    };

    const onFormSubmit = (data: { package: ServicePackageInsert, items: ServicePackageItemInsert[] }) => {
        if (!user) return;

        if (editingPackage?.id && formTitle !== 'Duplicate Service Package') {
            updatePackage.mutate({
                id: editingPackage.id,
                package: { ...data.package, user_id: user.id },
                items: data.items
            }, {
                onSuccess: () => setIsFormOpen(false)
            });
        } else {
            createPackage.mutate({
                package: { ...data.package, user_id: user.id },
                items: data.items
            }, {
                onSuccess: () => setIsFormOpen(false)
            });
        }
    };

    return (
        <AppLayout>
            <div className="space-y-6 animate-fade-in">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-foreground font-heading">Service Packages</h1>
                        <p className="text-muted-foreground">Manage quick job templates for your garage</p>
                    </div>
                    <Button onClick={handleCreate} className="gradient-accent text-accent-foreground font-semibold shadow-glow">
                        <Plus className="w-4 h-4 mr-2" />
                        Create Package
                    </Button>
                </div>

                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Search packages by name, description or category..."
                        className="w-full pl-10 pr-4 py-2.5 bg-card border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all shadow-sm"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>

                {isLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <Skeleton className="h-48 rounded-xl" />
                        <Skeleton className="h-48 rounded-xl" />
                        <Skeleton className="h-48 rounded-xl" />
                    </div>
                ) : filteredPackages.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredPackages.map((pkg) => (
                            <Card key={pkg.id} className="group hover:shadow-xl transition-all duration-300 border-border/50 overflow-hidden bg-card flex flex-col">
                                <CardHeader className="pb-3 border-b bg-muted/20">
                                    <div className="flex justify-between items-start gap-2">
                                        <div className="space-y-1">
                                            <CardTitle className="text-lg font-bold group-hover:text-primary-dark transition-colors flex items-center gap-2">
                                                {pkg.name}
                                            </CardTitle>
                                            {pkg.category && (
                                                <span className="inline-block text-[10px] sm:text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-primary/10 text-primary-dark border border-primary/20">
                                                    {pkg.category}
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex gap-1">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg"
                                                onClick={() => handleDuplicate(pkg)}
                                                title="Duplicate"
                                            >
                                                <Copy className="w-4 h-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg"
                                                onClick={() => handleEdit(pkg)}
                                                title="Edit"
                                            >
                                                <Edit2 className="w-4 h-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg"
                                                onClick={() => setDeleteId(pkg.id)}
                                                title="Delete"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="pt-4 flex-1 flex flex-col">
                                    <p className="text-sm text-muted-foreground line-clamp-2 italic mb-4">
                                        {pkg.description || 'No description provided.'}
                                    </p>

                                    <div className="grid grid-cols-2 gap-4 text-xs mb-6">
                                        <div className="flex items-center gap-2 text-muted-foreground p-2 rounded-lg bg-muted/30">
                                            <Clock className="w-4 h-4 text-primary-dark" />
                                            <span className="font-medium text-foreground">{pkg.estimated_time || 'N/A'}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-muted-foreground p-2 rounded-lg bg-muted/30">
                                            <BadgeCheck className="w-4 h-4 text-primary-dark" />
                                            <span className="font-medium text-foreground">{((pkg.checklist_items as string[]) || []).length} tasks</span>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between pt-4 border-t mt-auto">
                                        <div className="flex flex-col">
                                            <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Labor Charge</span>
                                            <span className="text-base font-bold text-foreground">₹{pkg.labor_charge?.toLocaleString()}</span>
                                        </div>
                                        <div className="flex flex-col items-end">
                                            <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Parts List</span>
                                            <span className="text-sm font-medium text-primary-dark">{(pkg.items || []).length} items</span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <Card className="border-dashed py-12 text-center bg-card/50">
                        <CardContent>
                            <Boxes className="w-12 h-12 mx-auto mb-4 opacity-20 text-primary" />
                            <h3 className="text-lg font-bold mb-1">No services packages yet</h3>
                            <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
                                {search ? 'No packages found matching your current search parameters.' : 'Create reusable job templates with parts and labor to speed up your workflow.'}
                            </p>
                            {!search && (
                                <Button onClick={handleCreate} className="gradient-accent text-accent-foreground font-semibold shadow-glow">
                                    <Plus className="w-4 h-4 mr-2" />
                                    Create Your First Package
                                </Button>
                            )}
                        </CardContent>
                    </Card>
                )}
            </div>

            <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-bold">{formTitle}</DialogTitle>
                        <DialogDescription>
                            Configure all parts, labor, and checklists for this service template.
                        </DialogDescription>
                    </DialogHeader>
                    <ServicePackageForm
                        title={formTitle}
                        initialData={editingPackage}
                        onSubmit={onFormSubmit}
                        onCancel={() => setIsFormOpen(false)}
                        isLoading={createPackage.isPending || updatePackage.isPending}
                    />
                </DialogContent>
            </Dialog>

            <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-xl font-bold">Delete Service Package?</AlertDialogTitle>
                        <AlertDialogDescription className="text-muted-foreground">
                            This will permanently delete the "<span className="font-semibold text-foreground">{packages?.find(p => p.id === deleteId)?.name}</span>" template and its associated parts list. This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="gap-2">
                        <AlertDialogCancel className="font-semibold">Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90 font-bold"
                        >
                            Delete Forever
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </AppLayout>
    );
}
