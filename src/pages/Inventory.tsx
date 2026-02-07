import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AppLayout from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Plus,
    Search,
    Loader2,
    Package,
    AlertTriangle,
    Pencil,
    Trash2,
    Boxes
} from 'lucide-react';
import {
    useInventory,
    useCreateInventoryItem,
    useUpdateInventoryItem,
    useDeleteInventoryItem
} from '@/hooks/useInventory';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import { InventoryItemInsert, InventoryItemUpdate } from '@/types/database';
import { useAuth } from '@/contexts/AuthContext';

export default function Inventory() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { data: inventory, isLoading } = useInventory();
    const createItem = useCreateInventoryItem();
    const updateItem = useUpdateInventoryItem();
    const deleteItem = useDeleteInventoryItem();

    const [searchTerm, setSearchTerm] = useState('');
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<any>(null);
    const [formData, setFormData] = useState({
        name: '',
        code: '',
        description: '',
        stock_quantity: '0',
        min_stock_level: '0',
        cost_price: '0',
        selling_price: '0'
    });

    const filteredInventory = inventory?.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.code?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleOpenAdd = () => {
        setEditingItem(null);
        setFormData({
            name: '',
            code: '',
            description: '',
            stock_quantity: '',
            min_stock_level: '',
            cost_price: '',
            selling_price: ''
        });
        setIsDialogOpen(true);
    };

    const handleOpenEdit = (item: any) => {
        setEditingItem(item);
        setFormData({
            name: item.name,
            code: item.code || '',
            description: item.description || '',
            stock_quantity: item.stock_quantity?.toString() || '0',
            min_stock_level: item.min_stock_level?.toString() || '0',
            cost_price: item.cost_price?.toString() || '0',
            selling_price: item.selling_price?.toString() || '0'
        });
        setIsDialogOpen(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        const submissionData = {
            name: formData.name,
            code: formData.code || null,
            description: formData.description || null,
            stock_quantity: parseInt(formData.stock_quantity) || 0,
            min_stock_level: parseInt(formData.min_stock_level) || 0,
            cost_price: parseFloat(formData.cost_price) || 0,
            selling_price: parseFloat(formData.selling_price) || 0
        };

        if (editingItem) {
            updateItem.mutate({
                id: editingItem.id,
                ...submissionData
            }, {
                onSuccess: () => setIsDialogOpen(false)
            });
        } else {
            createItem.mutate({
                user_id: user.id,
                ...submissionData
            }, {
                onSuccess: () => setIsDialogOpen(false)
            });
        }
    };

    return (
        <AppLayout>
            <div className="space-y-6 animate-fade-in">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Parts Mall</h1>
                        <p className="text-muted-foreground mt-1 text-lg">Manage your spare parts and stock levels.</p>
                    </div>
                    <Button onClick={handleOpenAdd} className="gradient-accent text-accent-foreground font-bold shadow-glow">
                        <Plus className="w-5 h-5 mr-2" />
                        Add New Part
                    </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card className="bg-primary/5 border-primary/20">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground uppercase flex items-center gap-2">
                                <Package className="w-4 h-4 text-primary" />
                                Total Items
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-3xl font-bold">{inventory?.length || 0}</p>
                        </CardContent>
                    </Card>
                    <Card className="bg-amber-500/5 border-amber-500/20">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground uppercase flex items-center gap-2">
                                <AlertTriangle className="w-4 h-4 text-amber-500" />
                                Low Stock
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-3xl font-bold text-amber-500">
                                {inventory?.filter(i => (i.stock_quantity ?? 0) < (i.min_stock_level ?? 0)).length || 0}
                            </p>
                        </CardContent>
                    </Card>
                    <Card className="bg-primary/10 border-primary/30 shadow-glow cursor-pointer hover:scale-[1.02] transition-transform" onClick={() => navigate('/packages')}>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground uppercase flex items-center gap-2">
                                <Boxes className="w-4 h-4 text-primary" />
                                Linked Packages
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-primary font-bold">Go to Service Packages →</p>
                        </CardContent>
                    </Card>
                </div>

                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                        placeholder="Search by part name or code..."
                        className="pl-10 h-12 text-lg shadow-sm"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="bg-card rounded-xl border border-border/50 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-muted/50 border-b">
                                    <th className="p-4 font-bold uppercase text-xs tracking-wider">Part Name / Code</th>
                                    <th className="p-4 font-bold uppercase text-xs tracking-wider">Stock Status</th>
                                    <th className="p-4 font-bold uppercase text-xs tracking-wider">Price (₹)</th>
                                    <th className="p-4 font-bold uppercase text-xs tracking-wider text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {isLoading ? (
                                    <tr>
                                        <td colSpan={4} className="p-10 text-center">
                                            <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
                                            <p className="mt-2 text-muted-foreground font-medium">Loading parts...</p>
                                        </td>
                                    </tr>
                                ) : filteredInventory?.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="p-10 text-center">
                                            <Package className="w-12 h-12 mx-auto text-muted-foreground/20 mb-3" />
                                            <p className="text-muted-foreground font-medium">No parts found matching your search.</p>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredInventory?.map((item) => (
                                        <tr key={item.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors group">
                                            <td className="p-4">
                                                <div className="flex flex-col">
                                                    <span className="font-bold text-base">{item.name}</span>
                                                    <span className="text-xs text-muted-foreground font-mono">{item.code || 'NO-CODE'}</span>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <div className="flex items-center gap-2">
                                                    <span className={`w-2 h-2 rounded-full ${(item.stock_quantity ?? 0) < (item.min_stock_level ?? 0) ? 'bg-amber-500 animate-pulse' : 'bg-green-500'}`} />
                                                    <span className={`font-bold ${(item.stock_quantity ?? 0) < (item.min_stock_level ?? 0) ? 'text-amber-500' : ''}`}>
                                                        {item.stock_quantity ?? 0} in stock
                                                    </span>
                                                    <span className="text-xs text-muted-foreground">(Min: {item.min_stock_level ?? 0})</span>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <div className="flex flex-col">
                                                    <span className="font-bold">₹{item.selling_price?.toLocaleString()}</span>
                                                    <span className="text-[10px] text-muted-foreground">Cost: ₹{item.cost_price?.toLocaleString()}</span>
                                                </div>
                                            </td>
                                            <td className="p-4 text-right">
                                                <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-primary" onClick={() => handleOpenEdit(item)}>
                                                        <Pencil className="w-4 h-4" />
                                                    </Button>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => deleteItem.mutate(item.id)}>
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogContent className="max-w-md">
                        <DialogHeader>
                            <DialogTitle className="text-xl font-bold">
                                {editingItem ? 'Edit Part' : 'Add New Part'}
                            </DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="name" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Part Name *</Label>
                                <Input
                                    id="name"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="e.g. Engine Oil 10W40"
                                    required
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="code" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Part Code / SKU</Label>
                                    <Input
                                        id="code"
                                        value={formData.code}
                                        onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                                        placeholder="P-001"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="stock" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Current Stock *</Label>
                                    <Input
                                        id="stock"
                                        type="number"
                                        value={formData.stock_quantity}
                                        onChange={(e) => setFormData({ ...formData, stock_quantity: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="cost" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Cost Price (₹)</Label>
                                    <Input
                                        id="cost"
                                        type="number"
                                        value={formData.cost_price}
                                        onChange={(e) => setFormData({ ...formData, cost_price: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="selling" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Selling Price (₹) *</Label>
                                    <Input
                                        id="selling"
                                        type="number"
                                        value={formData.selling_price}
                                        onChange={(e) => setFormData({ ...formData, selling_price: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="min" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Min Stock Level (Alert)</Label>
                                <Input
                                    id="min"
                                    type="number"
                                    value={formData.min_stock_level}
                                    onChange={(e) => setFormData({ ...formData, min_stock_level: e.target.value })}
                                />
                            </div>
                            <DialogFooter className="pt-4">
                                <Button type="button" variant="ghost" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                                <Button type="submit" disabled={createItem.isPending || updateItem.isPending} className="gradient-accent text-accent-foreground font-bold px-8">
                                    {(createItem.isPending || updateItem.isPending) ? (<Loader2 className="w-4 h-4 animate-spin mr-2" />) : null}
                                    {editingItem ? 'Save Changes' : 'Add Item'}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>
        </AppLayout>
    );
}
