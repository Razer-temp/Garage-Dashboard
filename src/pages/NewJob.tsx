import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  LayoutDashboard, Users, Briefcase, Bell, LogOut, Wrench, Menu, Settings as SettingsIcon, BarChart, Plus,
  Boxes, Search, ArrowLeft, Loader2, Sparkles, CheckCircle2
} from 'lucide-react';
import AppLayout from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
import { useCreateJob } from '@/hooks/useJobs';
import { useCustomers } from '@/hooks/useCustomers';
import { useBikes } from '@/hooks/useBikes';
import { useAuth } from '@/contexts/AuthContext';
import { z } from 'zod';
import { addMonths, format } from 'date-fns';
import { useServicePackages } from '@/hooks/useServicePackages';

const jobSchema = z.object({
  bike_id: z.string().min(1, 'Please select a vehicle'),
  problem_description: z.string().min(1, 'Problem description is required'),
  estimated_cost: z.number().min(0).optional(),
});

export default function NewJob() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const createJob = useCreateJob();
  const { data: customers } = useCustomers();
  const { data: servicePackages } = useServicePackages();

  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  const [customerOpen, setCustomerOpen] = useState(false);
  const [packageOpen, setPackageOpen] = useState(false);
  const { data: bikes } = useBikes(selectedCustomerId || undefined);

  const [formData, setFormData] = useState({
    bike_id: searchParams.get('bike') || '',
    problem_description: '',
    estimated_cost: '',
    parts_used: '',
    labor_cost: '',
    mechanic_notes: '',
    set_reminder: true,
    applied_package_id: null as string | null,
    applied_package_name: null as string | null,
    paid_amount: '0',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleApplyPackage = (pkgId: string) => {
    const pkg = servicePackages?.find(p => p.id === pkgId);
    if (!pkg) return;

    const partsTotal = (pkg.items || []).reduce((sum, item) => sum + ((item.quantity || 0) * (item.unit_price || 0)), 0);
    const partsList = (pkg.items || []).map(item => `${item.item_name} x${item.quantity} `).join('\n');

    setFormData({
      ...formData,
      problem_description: `${pkg.name}${pkg.description ? ` - ${pkg.description}` : ''} \n${formData.problem_description} `.trim(),
      labor_cost: pkg.labor_charge?.toString() || '',
      parts_used: partsList,
      estimated_cost: ((pkg.labor_charge || 0) + partsTotal).toString(),
      applied_package_id: pkg.id,
      applied_package_name: pkg.name
    });
    setPackageOpen(false);
  };

  // If bike is pre-selected, find its customer
  useEffect(() => {
    const bikeId = searchParams.get('bike');
    if (bikeId && customers) {
      // We need to find which customer owns this bike
      // For now, we'll need to check each customer's bikes
      customers.forEach(customer => {
        setSelectedCustomerId(customer.id);
      });
    }
  }, [searchParams, customers]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const validationResult = jobSchema.safeParse({
      ...formData,
      estimated_cost: formData.estimated_cost ? parseFloat(formData.estimated_cost) : undefined
    });

    if (!validationResult.success) {
      const newErrors: Record<string, string> = {};
      validationResult.error.issues.forEach((issue) => {
        if (issue.path[0]) {
          newErrors[issue.path[0] as string] = issue.message;
        }
      });
      setErrors(newErrors);
      return;
    }

    if (!user) return;

    // Calculate next service date (3 months from now)
    const nextServiceDate = formData.set_reminder
      ? format(addMonths(new Date(), 3), 'yyyy-MM-dd')
      : null;

    createJob.mutate(
      {
        bike_id: formData.bike_id,
        problem_description: formData.problem_description,
        estimated_cost: validationResult.data.estimated_cost || 0,
        parts_used: formData.parts_used || null,
        labor_cost: parseFloat(formData.labor_cost) || 0,
        mechanic_notes: formData.mechanic_notes || null,
        status: 'pending',
        payment_status: 'pending',
        date_in: new Date().toISOString(),
        user_id: user.id,
        applied_package_id: formData.applied_package_id,
        applied_package_name: formData.applied_package_name,
        next_service_date: nextServiceDate,
        next_service_mileage: null,
        paid_amount: parseFloat(formData.paid_amount) || 0,
      },
      {
        onSuccess: (data) => {
          navigate(`/jobs/${data.id}`);
        },
      }
    );
  };

  const selectedCustomer = customers?.find(c => c.id === selectedCustomerId);

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto animate-fade-in">
        <Button
          variant="ghost"
          className="mb-4"
          onClick={() => navigate('/jobs')}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Work Orders
        </Button>

        <Card className="border-border/50 shadow-xl overflow-hidden">
          <CardHeader className="bg-muted/20 border-b">
            <CardTitle className="text-2xl font-bold flex items-center gap-2">
              <Plus className="w-6 h-6 text-primary" />
              Create New Work Order
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="flex flex-col sm:flex-row gap-6">
                {/* Customer Selection */}
                <div className="space-y-2 flex-1">
                  <Label className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Select Customer *</Label>
                  <Popover open={customerOpen} onOpenChange={setCustomerOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        className="w-full justify-between h-11 text-base font-medium"
                      >
                        {selectedCustomer ? selectedCustomer.name : "Search customer..."}
                        <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[400px] p-0" align="start">
                      <Command>
                        <CommandInput placeholder="Search by name or phone..." />
                        <CommandList>
                          <CommandEmpty>No customer found.</CommandEmpty>
                          <CommandGroup>
                            {customers?.map((customer) => (
                              <CommandItem
                                key={customer.id}
                                value={`${customer.name} ${customer.phone} `}
                                onSelect={() => {
                                  setSelectedCustomerId(customer.id);
                                  setFormData({ ...formData, bike_id: '' });
                                  setCustomerOpen(false);
                                }}
                                className="p-3"
                              >
                                <div className="flex flex-col">
                                  <span className="font-bold">{customer.name}</span>
                                  <span className="text-xs text-muted-foreground group-data-[selected=true]:text-accent-foreground/90 group-aria-selected:text-accent-foreground/90">{customer.phone}</span>
                                </div>
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              {/* Vehicle Selection */}
              <div className="space-y-2">
                <Label className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Select Vehicle *</Label>
                <Select
                  value={formData.bike_id}
                  onValueChange={(value) => setFormData({ ...formData, bike_id: value })}
                  disabled={!selectedCustomerId}
                >
                  <SelectTrigger className={`h - 11 ${errors.bike_id ? 'border-destructive' : ''} `}>
                    <SelectValue placeholder={selectedCustomerId ? "Select vehicle" : "Select customer first"} />
                  </SelectTrigger>
                  <SelectContent>
                    {bikes?.map((bike) => (
                      <SelectItem key={bike.id} value={bike.id}>
                        {bike.registration_number} - {bike.make_model}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.bike_id && <p className="text-sm text-destructive font-medium">{errors.bike_id}</p>}
                {selectedCustomerId && (!bikes || bikes.length === 0) && (
                  <p className="text-sm text-muted-foreground bg-muted/30 p-2 rounded border border-dashed text-center">
                    No vehicles found. <Button variant="link" className="p-0 h-auto font-bold underline" onClick={() => navigate(`/ customers / ${selectedCustomerId} `)}>Add a vehicle</Button> first.
                  </p>
                )}
              </div>



              {/* Problem Description */}
              <div className="space-y-2">
                <Label htmlFor="problem" className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Problem Description *</Label>
                <Textarea
                  id="problem"
                  placeholder="Describe the issues reported by the customer..."
                  className={errors.problem_description ? 'border-destructive' : ''}
                  value={formData.problem_description}
                  onChange={(e) => setFormData({ ...formData, problem_description: e.target.value })}
                  rows={4}
                />
                {errors.problem_description && <p className="text-sm text-destructive font-medium">{errors.problem_description}</p>}
              </div>

              {/* Billing Info */}
              <div className="space-y-4 pt-4 border-t">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Billing Summary</Label>
                  {formData.applied_package_name && (
                    <span className="text-[10px] px-2 py-0.5 bg-primary/10 text-primary border border-primary/20 rounded-full font-bold flex items-center gap-1 animate-in zoom-in-50 duration-300">
                      <Sparkles className="w-3 h-3" />
                      TEMPLATE: {formData.applied_package_name}
                    </span>
                  )}
                </div>

                <Popover open={packageOpen} onOpenChange={setPackageOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-between h-11 border-primary/20 hover:border-primary/50 hover:bg-primary/5 transition-all text-sm font-semibold"
                    >
                      {formData.applied_package_name ? (
                        <span className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-primary" />
                          Applied: {formData.applied_package_name}
                        </span>
                      ) : (
                        <span className="flex items-center gap-2">
                          <Boxes className="w-4 h-4 text-primary" />
                          Apply Service Package Template
                        </span>
                      )}
                      <Plus className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[400px] p-0 shadow-2xl" align="start">
                    <Command>
                      <CommandInput placeholder="Search templates..." />
                      <CommandList>
                        <CommandEmpty>No templates matching your search.</CommandEmpty>
                        <CommandGroup heading="Available Packages">
                          {servicePackages?.map((pkg) => (
                            <CommandItem
                              key={pkg.id}
                              value={pkg.name}
                              onSelect={() => handleApplyPackage(pkg.id)}
                              className="p-3"
                            >
                              <div className="flex justify-between items-center w-full">
                                <div className="flex flex-col">
                                  <span className="font-bold">{pkg.name}</span>
                                  <span className="text-xs text-muted-foreground line-clamp-1">₹{(pkg.labor_charge || 0).toLocaleString()} • {pkg.description || 'No description'}</span>
                                </div>
                                <Button size="sm" variant="outline" className="h-7 text-[10px] font-bold">Apply</Button>
                              </div>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                        <CommandEmpty className="p-4 text-center">
                          <p className="text-xs text-muted-foreground mb-2">No templates found.</p>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-[10px] h-7"
                            onClick={() => navigate('/packages')}
                          >
                            Manage Packages
                          </Button>
                        </CommandEmpty>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-muted/30 rounded-xl border border-border/50">
                  <div className="space-y-2">
                    <Label htmlFor="labor" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Labor Cost (₹)</Label>
                    <Input
                      id="labor"
                      type="number"
                      placeholder="0"
                      value={formData.labor_cost}
                      onChange={(e) => setFormData({ ...formData, labor_cost: e.target.value })}
                      className="font-medium"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cost" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Estimated Total (₹)</Label>
                    <Input
                      id="cost"
                      type="number"
                      placeholder="0"
                      value={formData.estimated_cost}
                      onChange={(e) => setFormData({ ...formData, estimated_cost: e.target.value })}
                      className="font-bold text-primary"
                    />
                  </div>
                </div>
                <div className="p-4 bg-muted/50 rounded-xl border border-warning/20 mt-4">
                  <div className="space-y-2">
                    <Label htmlFor="paid" className="text-sm font-bold uppercase tracking-wider text-warning">Advance Payment / Amount Paid (₹)</Label>
                    <Input
                      id="paid"
                      type="number"
                      placeholder="0"
                      value={formData.paid_amount}
                      onChange={(e) => setFormData({ ...formData, paid_amount: e.target.value })}
                      className="font-bold border-warning/50 focus:ring-warning"
                    />
                    <p className="text-[10px] text-muted-foreground mt-1">Enter any advance payment received now.</p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="parts" className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Initial Parts List</Label>
                <Textarea
                  id="parts"
                  placeholder="List any parts known to be needed..."
                  value={formData.parts_used}
                  onChange={(e) => setFormData({ ...formData, parts_used: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes" className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Internal Notes</Label>
                <Textarea
                  id="notes"
                  placeholder="Notes for the mechanic (not shown to customer)..."
                  value={formData.mechanic_notes}
                  onChange={(e) => setFormData({ ...formData, mechanic_notes: e.target.value })}
                  rows={2}
                />
              </div>

              <div className="flex items-center space-x-2 pt-2">
                <input
                  type="checkbox"
                  id="reminder"
                  checked={formData.set_reminder}
                  onChange={(e) => setFormData({ ...formData, set_reminder: e.target.checked })}
                  className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                />
                <Label htmlFor="reminder" className="text-sm font-medium">Schedule 6-month service reminder automatically</Label>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  className="h-11 px-6 font-semibold"
                  onClick={() => navigate('/jobs')}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="h-11 px-8 gradient-accent text-accent-foreground font-bold shadow-glow"
                  disabled={createJob.isPending}
                >
                  {createJob.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Create Work Order
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
