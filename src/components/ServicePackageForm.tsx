import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Plus, Trash2, Search, X } from 'lucide-react';
import {
    ServicePackageWithItems,
    ServicePackageInsert,
    ServicePackageItemInsert,
} from '@/types/database';
import { useInventory } from '@/hooks/useInventory';
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from '@/components/ui/command';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';

interface ServicePackageFormProps {
    initialData?: ServicePackageWithItems;
    onSubmit: (data: { package: ServicePackageInsert, items: ServicePackageItemInsert[] }) => void;
    onCancel: () => void;
    isLoading?: boolean;
    title: string;
}

export default function ServicePackageForm({
    initialData,
    onSubmit,
    onCancel,
    isLoading,
    title
}: ServicePackageFormProps) {
    const { data: inventory } = useInventory();
    const [pkgData, setPkgData] = useState({
        name: initialData?.name || '',
        description: initialData?.description || '',
        category: initialData?.category || '',
        labor_charge: initialData?.labor_charge?.toString() || '0',
        gst_applicable: initialData?.gst_applicable ?? true,
        estimated_time: initialData?.estimated_time || '',
        checklist_items: (initialData?.checklist_items as string[]) || [],
    });

    const [items, setItems] = useState<any[]>(
        initialData?.items.map(item => ({
            item_name: item.item_name,
            quantity: item.quantity?.toString() || '1',
            unit_price: item.unit_price?.toString() || '0',
            inventory_item_id: item.inventory_item_id,
            package_id: item.package_id
        })) || []
    );

    const addItem = () => {
        setItems([...items, { item_name: '', quantity: '1', unit_price: '0', package_id: '' }]);
    };

    const removeItem = (index: number) => {
        setItems(items.filter((_, i) => i !== index));
    };

    const updateItem = (index: number, updates: any) => {
        const newItems = [...items];
        newItems[index] = { ...newItems[index], ...updates };
        setItems(newItems);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Strip items and other read-only fields before submission to avoid Supabase error
        const {
            items: _,
            id: __,
            created_at: ___,
            updated_at: ____,
            user_id: _____,
            ...cleanPkg
        } = pkgData as any;

        const submissionPkg = {
            ...cleanPkg,
            labor_charge: parseFloat(pkgData.labor_charge) || 0
        };

        const submissionItems = items.map(item => ({
            item_name: item.item_name,
            quantity: parseInt(item.quantity) || 0,
            unit_price: parseFloat(item.unit_price) || 0,
            inventory_item_id: item.inventory_item_id || null,
            package_id: ''
        }));

        onSubmit({
            package: submissionPkg as ServicePackageInsert,
            items: submissionItems as ServicePackageItemInsert[]
        });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Package Name *</Label>
                        <Input
                            id="name"
                            value={pkgData.name}
                            onChange={(e) => setPkgData({ ...pkgData, name: e.target.value })}
                            placeholder="e.g. Basic Service, Front Brake Overhaul"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="category">Category</Label>
                        <Input
                            id="category"
                            value={pkgData.category || ''}
                            onChange={(e) => setPkgData({ ...pkgData, category: e.target.value })}
                            placeholder="Routine Service, Brakes, etc."
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="description">Short Description</Label>
                    <Textarea
                        id="description"
                        value={pkgData.description || ''}
                        onChange={(e) => setPkgData({ ...pkgData, description: e.target.value })}
                        placeholder="What's included in this package?"
                        rows={2}
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="labor">Labor Charge (₹)</Label>
                        <Input
                            id="labor"
                            type="number"
                            value={pkgData.labor_charge}
                            onChange={(e) => setPkgData({ ...pkgData, labor_charge: e.target.value })}
                            placeholder="0"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="time">Estimated Time</Label>
                        <Input
                            id="time"
                            value={pkgData.estimated_time || ''}
                            onChange={(e) => setPkgData({ ...pkgData, estimated_time: e.target.value })}
                            placeholder="e.g. 45 min, 2 hrs"
                        />
                    </div>
                    <div className="flex items-center space-x-2 pt-8">
                        <Switch
                            id="gst"
                            checked={pkgData.gst_applicable}
                            onCheckedChange={(checked) => setPkgData({ ...pkgData, gst_applicable: checked })}
                        />
                        <Label htmlFor="gst">GST Applicable</Label>
                    </div>
                </div>
            </div>

            <div className="space-y-4 pt-4">
                <div className="flex items-center justify-between">
                    <Label className="text-lg font-semibold">Required Parts</Label>
                    <Button type="button" onClick={addItem} variant="outline" size="sm" className="h-8">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Part
                    </Button>
                </div>

                <div className="space-y-3">
                    {items.map((item, index) => (
                        <div key={index} className="grid grid-cols-12 gap-3 items-start animate-in slide-in-from-left-2 duration-200">
                            <div className="col-span-12 md:col-span-5">
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            role="combobox"
                                            className="w-full justify-between font-normal"
                                        >
                                            {item.item_name || "Select or type part..."}
                                            <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-[300px] p-0" align="start">
                                        <Command>
                                            <CommandInput
                                                placeholder="Search inventory..."
                                                onValueChange={(val) => updateItem(index, { item_name: val })}
                                            />
                                            <CommandList>
                                                {!inventory || inventory.length === 0 ? (
                                                    <div className="p-4 text-center text-sm text-muted-foreground">
                                                        Parts Mall is empty. Type above to add a custom part.
                                                    </div>
                                                ) : null}
                                                <CommandEmpty>
                                                    <div className="p-4 flex flex-col gap-2">
                                                        <p className="text-xs text-muted-foreground italic">No matching parts found in Parts Mall.</p>
                                                        <Button
                                                            variant="secondary"
                                                            size="sm"
                                                            className="w-full justify-start text-xs font-bold"
                                                            onClick={() => {
                                                                // The name is already updated via onValueChange
                                                            }}
                                                        >
                                                            <Plus className="w-3 h-3 mr-1" />
                                                            Use "{item.item_name}" as new part
                                                        </Button>
                                                    </div>
                                                </CommandEmpty>
                                                <CommandGroup heading="Parts Mall Items">
                                                    {inventory?.map((invItem) => (
                                                        <CommandItem
                                                            key={invItem.id}
                                                            value={invItem.name}
                                                            onSelect={() => {
                                                                updateItem(index, {
                                                                    item_name: invItem.name,
                                                                    unit_price: invItem.selling_price || 0,
                                                                    inventory_item_id: invItem.id
                                                                });
                                                            }}
                                                        >
                                                            <div className="flex flex-col">
                                                                <span className="font-medium">{invItem.name}</span>
                                                                <span className="text-xs text-muted-foreground">₹{invItem.selling_price} • Stock: {invItem.stock_quantity}</span>
                                                            </div>
                                                        </CommandItem>
                                                    ))}
                                                </CommandGroup>
                                            </CommandList>
                                        </Command>
                                    </PopoverContent>
                                </Popover>
                            </div>
                            <div className="col-span-4 md:col-span-2">
                                <Input
                                    type="number"
                                    value={item.quantity}
                                    onChange={(e) => updateItem(index, { quantity: e.target.value })}
                                    placeholder="Qty"
                                    min="0"
                                />
                            </div>
                            <div className="col-span-6 md:col-span-3">
                                <Input
                                    type="number"
                                    value={item.unit_price}
                                    onChange={(e) => updateItem(index, { unit_price: e.target.value })}
                                    placeholder="Price"
                                />
                            </div>
                            <div className="col-span-2 md:col-span-2 flex justify-end">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="text-destructive"
                                    onClick={() => removeItem(index)}
                                >
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                    ))}
                    {items.length === 0 && (
                        <p className="text-sm text-center py-6 text-muted-foreground bg-muted/10 border-dashed border rounded-lg">
                            No parts listed for this package. Click "Add Part" to include components.
                        </p>
                    )}
                </div>
            </div>

            <div className="flex justify-end gap-3 pt-6 border-t font-semibold">
                <div className="mr-auto text-lg">
                    Total: ₹{((parseFloat(pkgData.labor_charge) || 0) + items.reduce((sum, item) => sum + ((parseFloat(item.quantity) || 0) * (parseFloat(item.unit_price) || 0)), 0)).toLocaleString()}
                </div>
                <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
                    Cancel
                </Button>
                <Button type="submit" className="gradient-accent text-accent-foreground" disabled={isLoading}>
                    {isLoading ? 'Saving...' : 'Save Service Package'}
                </Button>
            </div>
        </form>
    );
}
