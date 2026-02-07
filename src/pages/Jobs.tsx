import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Plus, Briefcase, Filter, MessageCircle } from 'lucide-react';
import AppLayout from '@/components/layout/AppLayout';
import { SearchBar } from '@/components/ui/search-bar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { StatusBadge } from '@/components/ui/status-badge';
import { CommunicationDialog } from '@/components/CommunicationDialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useJobs } from '@/hooks/useJobs';
import { Skeleton } from '@/components/ui/skeleton';
import { format, formatDistanceToNow } from 'date-fns';
import { JobStatus } from '@/types/database';

export default function Jobs() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState('');
  const statusFilter = searchParams.get('status') as JobStatus | null;

  const { data: jobs, isLoading } = useJobs(statusFilter ?? undefined);

  const filteredJobs = jobs?.filter((job) => {
    const searchLower = search.toLowerCase();
    return (
      job.bike?.registration_number?.toLowerCase().includes(searchLower) ||
      job.bike?.customer?.name?.toLowerCase().includes(searchLower) ||
      job.bike?.customer?.phone?.includes(search) ||
      job.problem_description?.toLowerCase().includes(searchLower)
    );
  }) ?? [];

  const handleStatusChange = (value: string) => {
    if (value === 'all') {
      searchParams.delete('status');
    } else {
      searchParams.set('status', value);
    }
    setSearchParams(searchParams);
  };

  return (
    <AppLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Work Orders</h1>
            <p className="text-muted-foreground">Manage service work orders</p>
          </div>
          <Button asChild className="gradient-accent text-accent-foreground">
            <Link to="/jobs/new">
              <Plus className="w-4 h-4 mr-2" />
              New Work Order
            </Link>
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <SearchBar
            placeholder="Search by customer, phone, reg number..."
            value={search}
            onChange={setSearch}
          />
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <Select value={statusFilter ?? 'all'} onValueChange={handleStatusChange}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="ready_for_delivery">Ready for Delivery</SelectItem>
                <SelectItem value="delivered">Delivered</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Jobs List */}
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-28" />
            <Skeleton className="h-28" />
            <Skeleton className="h-28" />
          </div>
        ) : filteredJobs.length > 0 ? (
          <div className="space-y-4">
            {filteredJobs.map((job) => (
              <Link key={job.id} to={`/jobs/${job.id}`}>
                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="p-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-lg">
                            {job.bike?.registration_number}
                          </h3>
                          <StatusBadge status={job.status} />
                          <StatusBadge status={job.payment_status} type="payment" />
                          <div onClick={(e) => e.preventDefault()}>
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
                              trigger={
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-muted-foreground">
                                  <MessageCircle className="w-4 h-4" />
                                </Button>
                              }
                            />
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {job.bike?.customer?.name} • {job.bike?.make_model}
                        </p>
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                          {job.problem_description}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-1 text-right">
                        {(() => {
                          const total = job.final_total ?? (job.estimated_cost ?? 0);
                          const paid = job.paid_amount ?? 0;
                          const balance = total - paid;
                          return (
                            <>
                              <p className="text-sm font-medium text-muted-foreground">
                                Total: ₹{total.toLocaleString()}
                              </p>
                              <p className="text-sm font-medium text-success">
                                Paid: ₹{paid.toLocaleString()}
                              </p>
                              <div className="bg-warning/10 px-2 py-0.5 rounded border border-warning/20">
                                <p className="text-base font-bold text-warning leading-none">
                                  Due: ₹{balance.toLocaleString()}
                                </p>
                              </div>
                              <p className="text-[10px] text-muted-foreground mt-1">
                                {format(new Date(job.date_in), 'MMM d, yyyy')}
                              </p>
                            </>
                          );
                        })()}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            <Briefcase className="w-12 h-12 mx-auto mb-4 opacity-20" />
            <p className="mb-2">
              {search || statusFilter ? 'No work orders found matching your criteria' : 'No work orders yet'}
            </p>
            {!search && !statusFilter && (
              <Button asChild variant="link">
                <Link to="/jobs/new">Create your first work order</Link>
              </Button>
            )}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
