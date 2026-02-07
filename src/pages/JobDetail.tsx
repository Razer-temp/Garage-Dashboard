import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Phone, MessageCircle, Bike, Calendar, Clock, Loader2, Printer, Pencil, Trash2, Sparkles, CheckCircle2, Boxes, Plus } from 'lucide-react';
import AppLayout from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { StatusBadge } from '@/components/ui/status-badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
import { useJob, useUpdateJob, useDeleteJob, useGenerateInvoice } from '@/hooks/useJobs';
import { useSettings } from '@/hooks/useSettings';
import { useServicePackages } from '@/hooks/useServicePackages';
import { format, addMonths } from 'date-fns';
import { JobStatus, PaymentStatus, PaymentMethod } from '@/types/database';
import { InvoicePrint } from '@/components/InvoicePrint';
import { CommunicationDialog } from '@/components/CommunicationDialog';
import { toast } from 'sonner';

export default function JobDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: job, isLoading } = useJob(id!);
  const { data: settings } = useSettings();
  const { data: servicePackages } = useServicePackages();
  const updateJob = useUpdateJob();
  const deleteJob = useDeleteJob();
  const generateInvoice = useGenerateInvoice();

  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [packageOpen, setPackageOpen] = useState(false);
  const [showInvoice, setShowInvoice] = useState(false);
  const [editForm, setEditForm] = useState({
    problem_description: '',
    parts_used: '',
    labor_cost: '',
    final_total: '',
    gst_percent: '0',
    discount_amount: '0',
    mechanic_notes: '',
    next_service_date: '',
    next_service_mileage: '',
    payment_method: null as PaymentMethod | null,
    applied_package_id: null as string | null,
    applied_package_name: null as string | null,
    paid_amount: '0',
  });

  const handleStatusChange = (status: JobStatus) => {
    const updates: { id: string; status: JobStatus; date_out?: string } = {
      id: id!,
      status,
    };

    if (status === 'delivered') {
      updates.date_out = new Date().toISOString();
    }

    updateJob.mutate(updates);
  };

  const handlePaymentChange = (payment_status: PaymentStatus) => {
    updateJob.mutate({ id: id!, payment_status });
  };

  const openEditDialog = () => {
    if (job) {
      setEditForm({
        problem_description: job.problem_description || '',
        parts_used: job.parts_used || '',
        labor_cost: job.labor_cost === 0 ? '' : job.labor_cost?.toString() || '',
        final_total: job.final_total === 0 ? '' : job.final_total?.toString() || '',
        gst_percent: job.gst_percent === 0 ? '' : job.gst_percent?.toString() || '',
        discount_amount: job.discount_amount === 0 ? '' : job.discount_amount?.toString() || '',
        mechanic_notes: job.mechanic_notes || '',
        next_service_date: job.next_service_date || '',
        next_service_mileage: job.next_service_mileage?.toString() || '',
        payment_method: job.payment_method || null,
        applied_package_id: job.applied_package_id || null,
        applied_package_name: job.applied_package_name || null,
        paid_amount: job.paid_amount?.toString() || '0',
      });
      setShowEditDialog(true);
    }
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const labor = parseFloat(editForm.labor_cost) || 0;
    const final = parseFloat(editForm.final_total) || 0;
    const gstP = parseFloat(editForm.gst_percent) || 0;
    const discount = parseFloat(editForm.discount_amount) || 0;

    // Simple GST calculation logic: if final total includes GST
    const gstAmt = (final * gstP) / (100 + gstP);

    const handleApplyPackage = (pkgId: string) => {
      const pkg = servicePackages?.find(p => p.id === pkgId);
      if (!pkg) return;

      const partsTotal = (pkg.items || []).reduce((sum, item) => sum + ((item.quantity || 0) * (item.unit_price || 0)), 0);
      const partsList = (pkg.items || []).map(item => `${item.item_name} x${item.quantity} `).join('\n');

      setEditForm({
        ...editForm,
        problem_description: `${pkg.name}${pkg.description ? ` - ${pkg.description}` : ''} \n${editForm.problem_description} `.trim(),
        labor_cost: pkg.labor_charge?.toString() || '',
        parts_used: partsList,
        final_total: ((pkg.labor_charge || 0) + partsTotal).toString(),
        applied_package_id: pkg.id,
        applied_package_name: pkg.name
      });
      setPackageOpen(false);
    };

    updateJob.mutate(
      {
        id: id!,
        problem_description: editForm.problem_description,
        parts_used: editForm.parts_used || null,
        labor_cost: labor,
        final_total: final,
        gst_percent: gstP,
        gst_amount: gstAmt,
        discount_amount: discount,
        mechanic_notes: editForm.mechanic_notes || null,
        next_service_date: editForm.next_service_date || null,
        next_service_mileage: editForm.next_service_mileage ? parseInt(editForm.next_service_mileage) : null,
        payment_method: editForm.payment_method,
        applied_package_id: editForm.applied_package_id,
        applied_package_name: editForm.applied_package_name,
        paid_amount: parseFloat(editForm.paid_amount) || 0,
      },
      {
        onSuccess: () => setShowEditDialog(false),
      }
    );
  };

  const handleDelete = () => {
    deleteJob.mutate(id!, {
      onSuccess: () => navigate('/jobs'),
    });
  };

  const [showInvoicePreview, setShowInvoicePreview] = useState(false);

  const handlePrint = () => {
    if (!job.invoice_number) {
      toast.promise(generateInvoice.mutateAsync(id!), {
        loading: 'Generating sequential invoice number...',
        success: () => {
          setShowInvoicePreview(true);
          return 'Invoice number generated!';
        },
        error: (err) => `Failed to generate invoice: ${err.message}`,
      });
    } else {
      setShowInvoicePreview(true);
    }
  };

  const handleActualPrint = () => {
    window.print();
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className="space-y-4">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-60" />
          <Skeleton className="h-40" />
        </div>
      </AppLayout>
    );
  }

  if (!job) {
    return (
      <AppLayout>
        <div className="text-center py-12">
          <p className="text-muted-foreground">Work order not found</p>
          <Button variant="link" onClick={() => navigate('/jobs')}>
            Back to Work Orders
          </Button>
        </div>
      </AppLayout>
    );
  }

  const partsTotal = 0; // Could calculate from parts list if structured
  const laborCost = job.labor_cost ?? 0;
  const total = job.final_total ?? (job.estimated_cost ?? 0);

  return (
    <AppLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => navigate('/jobs')}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Work Orders
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handlePrint}>
              <Printer className="w-4 h-4 mr-2" />
              Invoice
            </Button>
            <CommunicationDialog
              customer={{
                id: job.bike?.customer?.id || '',
                name: job.bike?.customer?.name || '',
                phone: job.bike?.customer?.phone || '',
              }}
              bike_model={job.bike?.make_model}
              reg_number={job.bike?.registration_number}
              job_id={job.id}
              invoice_amount={job.final_total || 0}
              invoice_number={job.invoice_number || ''}
              pending_amount={(job.final_total || 0) - (job.payment_status === 'paid' ? (job.final_total || 0) : 0)}
              due_date={job.next_service_date || ''}
            />
            <Button variant="outline" size="sm" onClick={openEditDialog}>
              <Pencil className="w-4 h-4 mr-2" />
              Edit
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="text-destructive hover:text-destructive"
              onClick={() => setShowDeleteDialog(true)}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Job Header */}
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-3">
                  <CardTitle className="text-2xl">{job.bike?.registration_number}</CardTitle>
                  <StatusBadge status={job.status} />
                  <StatusBadge status={job.payment_status} type="payment" />
                  {job.applied_package_name && (
                    <span className="text-[10px] px-2 py-0.5 bg-primary/10 text-primary-dark border border-primary/20 rounded-full font-bold flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      {job.applied_package_name}
                    </span>
                  )}
                </div>
                <p className="text-muted-foreground mt-1">
                  {job.bike?.make_model} • {job.bike?.color}
                </p>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold">₹{total.toLocaleString()}</p>
                {job.invoice_number && (
                  <p className="text-xs font-mono text-muted-foreground mt-1">
                    Invoice: {job.invoice_number}
                  </p>
                )}
                <p className="text-sm text-muted-foreground">
                  Estimated: ₹{(job.estimated_cost ?? 0).toLocaleString()}
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* Quick Actions */}
            <div className="flex flex-wrap gap-4 mb-6">
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Order Status</Label>
                <Select value={job.status} onValueChange={(v) => handleStatusChange(v as JobStatus)}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="ready_for_delivery">Ready for Delivery</SelectItem>
                    <SelectItem value="delivered">Delivered</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Payment Status</Label>
                <Select value={job.payment_status} onValueChange={(v) => handlePaymentChange(v as PaymentStatus)}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Unpaid</SelectItem>
                    <SelectItem value="partial">Partial</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Customer Info */}
            <div className="flex flex-wrap gap-4 p-4 bg-muted/50 rounded-lg">
              <Link
                to={`/customers/${job.bike?.customer?.id}`}
                className="font-medium hover:text-accent transition-colors"
              >
                {job.bike?.customer?.name}
              </Link>
              <a
                href={`tel:${job.bike?.customer?.phone}`}
                className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
              >
                <Phone className="w-4 h-4" />
                {job.bike?.customer?.phone}
              </a>
              {job.bike?.customer?.whatsapp && (
                <a
                  href={`https://wa.me/${job.bike.customer.whatsapp.replace(/\D/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-sm text-success hover:underline"
                >
                  <MessageCircle className="w-4 h-4" />
                  WhatsApp
                </a>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Job Details */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Work Order Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-xs text-muted-foreground">Problem Description</Label>
                <p className="mt-1">{job.problem_description}</p>
              </div>
              {job.parts_used && (
                <div>
                  <Label className="text-xs text-muted-foreground">Parts Used</Label>
                  <p className="mt-1 whitespace-pre-line">{job.parts_used}</p>
                </div>
              )}
              {job.mechanic_notes && (
                <div>
                  <Label className="text-xs text-muted-foreground">Mechanic Notes</Label>
                  <p className="mt-1 whitespace-pre-line">{job.mechanic_notes}</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Billing & Schedule</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <span>Date In: {format(new Date(job.date_in), 'PPP')}</span>
              </div>
              {job.date_out && (
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <span>Date Out: {format(new Date(job.date_out), 'PPP')}</span>
                </div>
              )}

              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Labor Cost</span>
                  <span>₹{laborCost.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Parts Total</span>
                  <span>₹{(total - laborCost - (job.gst_amount || 0) + (job.discount_amount || 0)).toLocaleString()}</span>
                </div>
                {job.applied_package_name && (
                  <div className="flex justify-between text-xs pt-2 border-t border-dashed mt-2">
                    <span className="text-primary-dark font-medium flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      Service Template
                    </span>
                    <span className="font-bold">{job.applied_package_name}</span>
                  </div>
                )}
                {job.gst_amount ? (
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>GST ({job.gst_percent}%)</span>
                    <span>₹{job.gst_amount.toLocaleString()}</span>
                  </div>
                ) : null}
                {job.discount_amount ? (
                  <div className="flex justify-between text-sm text-red-500">
                    <span>Discount</span>
                    <span>- ₹{job.discount_amount.toLocaleString()}</span>
                  </div>
                ) : null}
                <div className="flex justify-between font-semibold text-lg border-t pt-2">
                  <span>Grand Total</span>
                  <span>₹{total.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm text-success font-medium">
                  <span>Amount Paid</span>
                  <span>₹{(job.paid_amount || 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between font-bold text-xl border-t-2 border-double pt-2 text-warning">
                  <span>Balance Due</span>
                  <span>₹{(total - (job.paid_amount || 0)).toLocaleString()}</span>
                </div>
              </div>

              {job.next_service_date && (
                <div className="border-t pt-4">
                  <Label className="text-xs text-muted-foreground">Next Service Due</Label>
                  <p className="mt-1 font-medium text-warning">
                    {format(new Date(job.next_service_date), 'PPP')}
                  </p>
                  {job.next_service_mileage && (
                    <p className="text-sm text-muted-foreground">
                      or at {job.next_service_mileage.toLocaleString()} km
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Edit Dialog */}
        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Work Order</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div className="space-y-2 pb-2 border-b">
                <Label className="text-xs font-bold uppercase tracking-wider text-primary-dark flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4" />
                  Package & Description
                </Label>
                <Popover open={packageOpen} onOpenChange={setPackageOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-between h-10 border-primary/20 hover:border-primary/50 text-xs font-semibold"
                    >
                      {editForm.applied_package_name ? (
                        <span className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-primary-dark" />
                          Template: {editForm.applied_package_name}
                        </span>
                      ) : (
                        <span className="flex items-center gap-2 text-muted-foreground">
                          <Boxes className="w-4 h-4" />
                          Apply Service Template...
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
                              onSelect={() => {
                                // We need to define handleApplyPackage inside the component or pass it
                                // I'll use the one I added but I need to make sure it's accessible.
                                // Actually, I'll just inline the logic here to keep it simple and avoid scoping issues.
                                const partsTotal = (pkg.items || []).reduce((sum, item) => sum + ((item.quantity || 0) * (item.unit_price || 0)), 0);
                                const partsList = (pkg.items || []).map(item => `${item.item_name} x${item.quantity} `).join('\n');

                                setEditForm({
                                  ...editForm,
                                  problem_description: `${pkg.name}${pkg.description ? ` - ${pkg.description}` : ''} \n${editForm.problem_description} `.trim(),
                                  labor_cost: pkg.labor_charge?.toString() || '',
                                  parts_used: partsList,
                                  final_total: ((pkg.labor_charge || 0) + partsTotal).toString(),
                                  applied_package_id: pkg.id,
                                  applied_package_name: pkg.name
                                });
                                setPackageOpen(false);
                              }}
                              className="p-3 cursor-pointer"
                            >
                              <div className="flex justify-between items-center w-full">
                                <div className="flex flex-col">
                                  <span className="font-bold">{pkg.name}</span>
                                  <span className="text-xs text-muted-foreground line-clamp-1">₹{(pkg.labor_charge || 0).toLocaleString()} • {pkg.description || 'No description'}</span>
                                </div>
                                <Button size="sm" variant="outline" className="h-7 text-[10px] font-bold pointer-events-none">Apply</Button>
                              </div>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                        <CommandEmpty className="p-4 text-center">
                          <p className="text-xs text-muted-foreground mb-2">No templates found.</p>
                        </CommandEmpty>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>

                <Label className="text-[10px] text-muted-foreground pt-2 block">Problem Description</Label>
                <Textarea
                  value={editForm.problem_description}
                  onChange={(e) => setEditForm({ ...editForm, problem_description: e.target.value })}
                  rows={3}
                  className="text-sm"
                />
              </div>
              <div className="space-y-2">
                <Label>Parts Used</Label>
                <Textarea
                  value={editForm.parts_used}
                  onChange={(e) => setEditForm({ ...editForm, parts_used: e.target.value })}
                  rows={2}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Labor Cost (₹)</Label>
                  <Input
                    type="number"
                    value={editForm.labor_cost}
                    onChange={(e) => setEditForm({ ...editForm, labor_cost: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Final Total (₹)</Label>
                  <Input
                    type="number"
                    value={editForm.final_total}
                    onChange={(e) => setEditForm({ ...editForm, final_total: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Discount (₹)</Label>
                <Input
                  type="number"
                  value={editForm.discount_amount}
                  onChange={(e) => setEditForm({ ...editForm, discount_amount: e.target.value })}
                />
              </div>
              <div className="space-y-2 p-3 bg-muted/50 rounded-lg border border-warning/20">
                <Label className="text-warning font-bold">Amount Paid (₹)</Label>
                <Input
                  type="number"
                  value={editForm.paid_amount}
                  onChange={(e) => setEditForm({ ...editForm, paid_amount: e.target.value })}
                  className="font-bold border-warning/50 focus:ring-warning"
                />
                <p className="text-[10px] text-muted-foreground mt-1">Enter how much the customer has already paid.</p>
              </div>


              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Payment Method</Label>
                  <Select
                    value={editForm.payment_method}
                    onValueChange={(v) => setEditForm({ ...editForm, payment_method: v as PaymentMethod })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cash">Cash</SelectItem>
                      <SelectItem value="upi">UPI</SelectItem>
                      <SelectItem value="card">Card (Credit/Debit)</SelectItem>
                      <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Mechanic Notes</Label>
                <Textarea
                  value={editForm.mechanic_notes}
                  onChange={(e) => setEditForm({ ...editForm, mechanic_notes: e.target.value })}
                  rows={2}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Next Service Date</Label>
                  <Input
                    type="date"
                    value={editForm.next_service_date}
                    onChange={(e) => setEditForm({ ...editForm, next_service_date: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Next Service Mileage</Label>
                  <Input
                    type="number"
                    value={editForm.next_service_mileage}
                    onChange={(e) => setEditForm({ ...editForm, next_service_mileage: e.target.value })}
                    placeholder="km"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="outline" onClick={() => setShowEditDialog(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="gradient-accent text-accent-foreground" disabled={updateJob.isPending}>
                  {updateJob.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Save Changes
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation */}
        <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Work Order?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete this work order card. This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Invoice Preview Dialog */}
        <Dialog open={showInvoicePreview} onOpenChange={setShowInvoicePreview}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader className="print:hidden">
              <DialogTitle className="flex justify-between items-center">
                <span>Invoice Preview</span>
                <Button onClick={handleActualPrint} className="gradient-accent text-accent-foreground">
                  <Printer className="w-4 h-4 mr-2" />
                  Print / Save PDF
                </Button>
              </DialogTitle>
            </DialogHeader>
            <div className="bg-muted p-4 rounded-lg print:p-0 print:bg-white">
              <InvoicePrint job={job} settings={settings} />
            </div>
          </DialogContent>
        </Dialog>

        {/* Print rendering container (only for direct print if needed, but handled by Dialog now) */}
        <div className="hidden print:block fixed inset-0 bg-white z-[9999]">
          <InvoicePrint job={job} settings={settings} />
        </div>
      </div>
    </AppLayout >
  );
}
