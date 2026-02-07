import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Phone, MessageCircle, MapPin, Plus, Bike, MoreVertical, Loader2, Pencil, Trash2 } from 'lucide-react';
import AppLayout from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useCustomer } from '@/hooks/useCustomers';
import { useCreateBike, useUpdateBike, useDeleteBike } from '@/hooks/useBikes';
import { useJobsByBike } from '@/hooks/useJobs';
import { useCommunicationLogs } from '@/hooks/useCommunication';
import { StatusBadge } from '@/components/ui/status-badge';
import { CommunicationDialog } from '@/components/CommunicationDialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { format } from 'date-fns';
import { z } from 'zod';

const bikeSchema = z.object({
  registration_number: z.string().min(1, 'Registration number is required'),
  make_model: z.string().min(1, 'Make/model is required'),
  year: z.number().min(1900).max(new Date().getFullYear() + 1).optional(),
  color: z.string().optional(),
  engine_number: z.string().optional(),
  chassis_number: z.string().optional(),
  last_mileage: z.number().min(0).optional(),
});

function BikeJobHistory({ bikeId }: { bikeId: string }) {
  const { data: jobs, isLoading } = useJobsByBike(bikeId);

  if (isLoading) return <Skeleton className="h-20" />;

  if (!jobs || jobs.length === 0) {
    return <p className="text-sm text-muted-foreground">No service history</p>;
  }

  return (
    <div className="space-y-2">
      {jobs.slice(0, 3).map((job) => (
        <Link
          key={job.id}
          to={`/jobs/${job.id}`}
          className="block p-2 rounded border bg-muted/30 hover:bg-muted/50 transition-colors"
        >
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">
              {format(new Date(job.date_in), 'MMM d, yyyy')}
            </span>
            <StatusBadge status={job.status} />
          </div>
          <p className="text-xs text-muted-foreground truncate mt-1">
            {job.problem_description}
          </p>
        </Link>
      ))}
      {jobs.length > 3 && (
        <p className="text-xs text-muted-foreground">+{jobs.length - 3} more work orders</p>
      )}
    </div>
  );
}

function CommunicationHistory({ customerId }: { customerId: string }) {
  const { data: logs, isLoading } = useCommunicationLogs(customerId);

  if (isLoading) return <Skeleton className="h-40" />;

  if (!logs || logs.length === 0) {
    return (
      <div className="text-center py-12 border-2 border-dashed rounded-lg bg-muted/20">
        <MessageCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-20" />
        <p className="text-muted-foreground font-medium">No messages sent to this customer yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto border rounded-xl bg-card">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-muted/50 border-b">
              <th className="p-4 text-left font-semibold">Date</th>
              <th className="p-4 text-left font-semibold">Template</th>
              <th className="p-4 text-left font-semibold">Message Preview</th>
              <th className="p-4 text-left font-semibold">Method</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <tr key={log.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                <td className="p-4 text-muted-foreground whitespace-nowrap">
                  {format(new Date(log.created_at), 'dd-MMM • hh:mm a')}
                </td>
                <td className="p-4 font-medium uppercase text-[10px] tracking-wider text-accent">
                  {log.template_name || 'Manual'}
                </td>
                <td className="p-4 max-w-[300px]">
                  <p className="line-clamp-2 italic text-muted-foreground">"{log.message_content}"</p>
                </td>
                <td className="p-4">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-tighter ${log.sent_via === 'whatsapp' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                    }`}>
                    {log.sent_via}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function CustomerDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: customer, isLoading } = useCustomer(id!);
  const createBike = useCreateBike();
  const updateBike = useUpdateBike();
  const deleteBike = useDeleteBike();

  const [bikeDialogOpen, setBikeDialogOpen] = useState(false);
  const [editingBike, setEditingBike] = useState<any>(null);
  const [deleteBikeId, setDeleteBikeId] = useState<string | null>(null);
  const [bikeForm, setBikeForm] = useState({
    registration_number: '',
    make_model: '',
    year: '',
    color: '',
    engine_number: '',
    chassis_number: '',
    last_mileage: '',
  });
  const [bikeErrors, setBikeErrors] = useState<Record<string, string>>({});

  const handleAddBike = (e: React.FormEvent) => {
    e.preventDefault();
    setBikeErrors({});

    const bikeData = {
      registration_number: bikeForm.registration_number,
      make_model: bikeForm.make_model,
      year: bikeForm.year ? parseInt(bikeForm.year) : undefined,
      color: bikeForm.color || undefined,
      engine_number: bikeForm.engine_number || undefined,
      chassis_number: bikeForm.chassis_number || undefined,
      last_mileage: bikeForm.last_mileage ? parseInt(bikeForm.last_mileage) : undefined,
    };

    const validation = bikeSchema.safeParse(bikeData);
    if (!validation.success) {
      const fieldErrors: Record<string, string> = {};
      validation.error.errors.forEach((err) => {
        if (err.path[0]) {
          fieldErrors[err.path[0] as string] = err.message;
        }
      });
      setBikeErrors(fieldErrors);
      return;
    }

    if (editingBike) {
      updateBike.mutate(
        {
          id: editingBike.id,
          ...bikeData,
          year: bikeData.year ?? null,
          color: bikeData.color ?? null,
          engine_number: bikeData.engine_number ?? null,
          chassis_number: bikeData.chassis_number ?? null,
          last_mileage: bikeData.last_mileage ?? null,
        },
        {
          onSuccess: () => {
            setBikeDialogOpen(false);
            setEditingBike(null);
            setBikeForm({
              registration_number: '',
              make_model: '',
              year: '',
              color: '',
              engine_number: '',
              chassis_number: '',
              last_mileage: '',
            });
          },
        }
      );
    } else {
      createBike.mutate(
        {
          customer_id: id!,
          registration_number: bikeForm.registration_number,
          make_model: bikeForm.make_model,
          year: bikeForm.year ? parseInt(bikeForm.year) : null,
          color: bikeForm.color || null,
          engine_number: bikeForm.engine_number || null,
          chassis_number: bikeForm.chassis_number || null,
          last_mileage: bikeForm.last_mileage ? parseInt(bikeForm.last_mileage) : 0,
        },
        {
          onSuccess: () => {
            setBikeDialogOpen(false);
            setBikeForm({
              registration_number: '',
              make_model: '',
              year: '',
              color: '',
              engine_number: '',
              chassis_number: '',
              last_mileage: '',
            });
          },
        }
      );
    }
  };

  const openEditBike = (bike: any) => {
    setEditingBike(bike);
    setBikeForm({
      registration_number: bike.registration_number,
      make_model: bike.make_model,
      year: bike.year?.toString() || '',
      color: bike.color || '',
      engine_number: bike.engine_number || '',
      chassis_number: bike.chassis_number || '',
      last_mileage: bike.last_mileage?.toString() || '',
    });
    setBikeDialogOpen(true);
  };

  const handleDeleteBike = () => {
    if (deleteBikeId) {
      deleteBike.mutate(deleteBikeId, {
        onSuccess: () => setDeleteBikeId(null),
      });
    }
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className="space-y-4">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-40" />
          <Skeleton className="h-60" />
        </div>
      </AppLayout>
    );
  }

  if (!customer) {
    return (
      <AppLayout>
        <div className="text-center py-12">
          <p className="text-muted-foreground">Customer not found</p>
          <Button variant="link" onClick={() => navigate('/customers')}>
            Back to Customers
          </Button>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6 animate-fade-in">
        <Button
          variant="ghost"
          className="mb-4"
          onClick={() => navigate('/customers')}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Customers
        </Button>

        {/* Customer Info */}
        <Card>
          <CardHeader className="flex flex-row items-start justify-between">
            <div>
              <CardTitle className="text-2xl">{customer.name}</CardTitle>
              {customer.notes && (
                <p className="text-sm text-muted-foreground mt-1">{customer.notes}</p>
              )}
            </div>
            <div className="flex gap-2">
              <CommunicationDialog
                customer={{
                  id: customer.id,
                  name: customer.name,
                  phone: customer.phone,
                }}
              />
              <Button variant="outline" size="sm" asChild>
                <Link to={`/customers/${customer.id}/edit`}>
                  <Pencil className="w-4 h-4 mr-2" />
                  Edit
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              <a
                href={`tel:${customer.phone}`}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-muted hover:bg-muted/80 transition-colors"
              >
                <Phone className="w-4 h-4 text-accent" />
                {customer.phone}
              </a>
              {customer.whatsapp && (
                <a
                  href={`https://wa.me/${customer.whatsapp.replace(/\D/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-success/10 hover:bg-success/20 transition-colors text-success"
                >
                  <MessageCircle className="w-4 h-4" />
                  WhatsApp
                </a>
              )}
              {customer.address && (
                <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-muted">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  {customer.address}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="mt-8">
          <Tabs defaultValue="vehicles" className="w-full">
            <TabsList className="grid w-[400px] grid-cols-2 mb-6">
              <TabsTrigger value="vehicles" className="gap-2">
                <Bike className="w-4 h-4" />
                Vehicles & History
              </TabsTrigger>
              <TabsTrigger value="messages" className="gap-2">
                <MessageCircle className="w-4 h-4" />
                Communication Log
              </TabsTrigger>
            </TabsList>

            <TabsContent value="vehicles">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Bike className="w-5 h-5 text-accent" />
                    Vehicles ({customer.bikes?.length ?? 0})
                  </CardTitle>
                  <Dialog open={bikeDialogOpen} onOpenChange={setBikeDialogOpen}>
                    <DialogTrigger asChild>
                      <Button size="sm" className="gradient-accent text-accent-foreground">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Vehicle
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>{editingBike ? 'Edit Vehicle' : 'Add New Vehicle'}</DialogTitle>
                      </DialogHeader>
                      <form onSubmit={handleAddBike} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Registration Number *</Label>
                            <Input
                              value={bikeForm.registration_number}
                              onChange={(e) => setBikeForm({ ...bikeForm, registration_number: e.target.value })}
                              placeholder="MH 01 AB 1234"
                              className={bikeErrors.registration_number ? 'border-destructive' : ''}
                            />
                            {bikeErrors.registration_number && (
                              <p className="text-xs text-destructive">{bikeErrors.registration_number}</p>
                            )}
                          </div>
                          <div className="space-y-2">
                            <Label>Make/Model *</Label>
                            <Input
                              value={bikeForm.make_model}
                              onChange={(e) => setBikeForm({ ...bikeForm, make_model: e.target.value })}
                              placeholder="Honda Activa"
                              className={bikeErrors.make_model ? 'border-destructive' : ''}
                            />
                            {bikeErrors.make_model && (
                              <p className="text-xs text-destructive">{bikeErrors.make_model}</p>
                            )}
                          </div>
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                          <div className="space-y-2">
                            <Label>Year</Label>
                            <Input
                              type="number"
                              value={bikeForm.year}
                              onChange={(e) => setBikeForm({ ...bikeForm, year: e.target.value })}
                              placeholder="2023"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Color</Label>
                            <Input
                              value={bikeForm.color}
                              onChange={(e) => setBikeForm({ ...bikeForm, color: e.target.value })}
                              placeholder="Black"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Mileage (km)</Label>
                            <Input
                              type="number"
                              value={bikeForm.last_mileage}
                              onChange={(e) => setBikeForm({ ...bikeForm, last_mileage: e.target.value })}
                              placeholder="15000"
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Engine Number</Label>
                            <Input
                              value={bikeForm.engine_number}
                              onChange={(e) => setBikeForm({ ...bikeForm, engine_number: e.target.value })}
                              placeholder="Engine number"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Chassis Number</Label>
                            <Input
                              value={bikeForm.chassis_number}
                              onChange={(e) => setBikeForm({ ...bikeForm, chassis_number: e.target.value })}
                              placeholder="Chassis number"
                            />
                          </div>
                        </div>
                        <div className="flex justify-end gap-3 pt-4">
                          <Button type="button" variant="outline" onClick={() => {
                            setBikeDialogOpen(false);
                            setEditingBike(null);
                            setBikeForm({
                              registration_number: '',
                              make_model: '',
                              year: '',
                              color: '',
                              engine_number: '',
                              chassis_number: '',
                              last_mileage: '',
                            });
                          }}>
                            Cancel
                          </Button>
                          <Button type="submit" className="gradient-accent text-accent-foreground" disabled={createBike.isPending || updateBike.isPending}>
                            {(createBike.isPending || updateBike.isPending) && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                            {editingBike ? 'Update Vehicle' : 'Add Vehicle'}
                          </Button>
                        </div>
                      </form>
                    </DialogContent>
                  </Dialog>
                </CardHeader>
                <CardContent>
                  {customer.bikes && customer.bikes.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {customer.bikes.map((bike) => (
                        <Card key={bike.id} className="border">
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between mb-3">
                              <div>
                                <h4 className="font-semibold">{bike.registration_number}</h4>
                                <p className="text-sm text-muted-foreground">{bike.make_model}</p>
                              </div>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                    <MoreVertical className="w-4 h-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => openEditBike(bike)}>
                                    <Pencil className="w-4 h-4 mr-2" />
                                    Edit
                                  </DropdownMenuItem>
                                  <DropdownMenuItem asChild>
                                    <Link to={`/jobs/new?bike=${bike.id}`}>Create Work Order</Link>
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    className="text-destructive"
                                    onClick={() => setDeleteBikeId(bike.id)}
                                  >
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    Delete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                            <div className="text-xs text-muted-foreground space-y-1 mb-3">
                              {bike.year && <p>Year: {bike.year}</p>}
                              {bike.color && <p>Color: {bike.color}</p>}
                              {bike.last_mileage && <p>Mileage: {bike.last_mileage.toLocaleString()} km</p>}
                            </div>
                            <div className="border-t pt-3">
                              <p className="text-xs font-medium text-muted-foreground mb-2">Service History</p>
                              <BikeJobHistory bikeId={bike.id} />
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <Bike className="w-12 h-12 mx-auto mb-2 opacity-20" />
                      <p>No vehicles registered</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="messages">
              <CommunicationHistory customerId={customer.id} />
            </TabsContent>
          </Tabs>
        </div>
        {/* Delete Bike Confirmation */}
        <AlertDialog open={!!deleteBikeId} onOpenChange={() => setDeleteBikeId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Vehicle?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete this vehicle and all its work order history. This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteBike}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </AppLayout>
  );
}
