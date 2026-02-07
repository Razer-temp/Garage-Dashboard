import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Trash2, Search } from 'lucide-react';
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

interface JobPart {
    item_name: string;
    quantity: string;
    unit_price: string;
    inventory_item_id: string | null;
}

interface JobPartsFormProps {
    parts: JobPart[];
    onChange: (parts: JobPart[]) => void;
}

export default function JobPartsForm({ parts, onChange }: JobPartsFormProps) {
    const { data: inventory } = useInventory();

    const addPart = () => {
        onChange([...parts, { item_name: '', quantity: '1', unit_price: '0', inventory_item_id: null }]);
    };

    const removePart = (index: number) => {
        onChange(parts.filter((_, i) => i !== index));
    };

    const updatePart = (index: number, updates: Partial<JobPart>) => {
        const newParts = [...parts];
        newParts[index] = { ...newParts[index], ...updates };
        onChange(newParts);
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <Label className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Parts / Items Used</Label>
                <Button type="button" onClick={addPart} variant="outline" size="sm" className="h-8">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Part
                </Button>
            </div>

            <div className="space-y-3">
                {parts.map((part, index) => (
                    <div key={index} className="grid grid-cols-12 gap-3 items-start animate-in slide-in-from-left-2 duration-200">
                        <div className="col-span-12 md:col-span-5">
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        role="combobox"
                                        className="w-full justify-between font-normal h-10"
                                    >
                                        {part.item_name || "Select or type part..."}
                                        <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-[300px] p-0" align="start">
                                    <Command>
                                        <CommandInput
                                            placeholder="Search inventory..."
                                            onValueChange={(val) => updatePart(index, { item_name: val })}
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
                                                        Use "{part.item_name}" as new part
                                                    </Button>
                                                </div>
                                            </CommandEmpty>
                                            <CommandGroup heading="Parts Mall Items">
                                                {inventory?.map((invItem) => (
                                                    <CommandItem
                                                        key={invItem.id}
                                                        value={invItem.name}
                                                        onSelect={() => {
                                                            updatePart(index, {
                                                                item_name: invItem.name,
                                                                unit_price: invItem.selling_price?.toString() || '0',
                                                                inventory_item_id: invItem.id,
                                                                quantity: '1'
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
                                value={part.quantity}
                                onChange={(e) => updatePart(index, { quantity: e.target.value })}
                                placeholder="Qty"
                                min="0"
                                className="h-10"
                            />
                        </div>
                        <div className="col-span-6 md:col-span-3">
                            <Input
                                type="number"
                                value={part.unit_price}
                                onChange={(e) => updatePart(index, { unit_price: e.target.value })}
                                placeholder="Price"
                                className="h-10"
                            />
                        </div>
                        <div className="col-span-2 md:col-span-2 flex justify-end">
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="text-destructive h-10"
                                onClick={() => removePart(index)}
                            >
                                <Trash2 className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                ))}
                {parts.length === 0 && (
                    <p className="text-sm text-center py-6 text-muted-foreground bg-muted/10 border-dashed border rounded-lg">
                        No parts listed. Click "Add Part" to include components and track inventory.
                    </p>
                )}
            </div>
        </div>
    );
}
