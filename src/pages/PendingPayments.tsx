import { useState } from 'react';
import { Link } from 'react-router-dom';
import { CreditCard, Briefcase, Search } from 'lucide-react';
import AppLayout from '@/components/layout/AppLayout';
import { SearchBar } from '@/components/ui/search-bar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { StatusBadge } from '@/components/ui/status-badge';
import { useJobs } from '@/hooks/useJobs';
import { Skeleton } from '@/components/ui/skeleton';
import { format, formatDistanceToNow } from 'date-fns';

export default function PendingPayments() {
    const [search, setSearch] = useState('');
    const { data: jobs, isLoading } = useJobs(undefined, ['pending', 'partial']);

    const filteredJobs = jobs?.filter((job) => {
        const searchLower = search.toLowerCase();
        return (
            job.bike?.registration_number?.toLowerCase().includes(searchLower) ||
            job.bike?.customer?.name?.toLowerCase().includes(searchLower) ||
            job.bike?.customer?.phone?.includes(search)
        );
    }) ?? [];

    return (
        <AppLayout>
            <div className="space-y-6 animate-fade-in">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-foreground">Pending Payments</h1>
                        <p className="text-muted-foreground">Manage outstanding service payments</p>
                    </div>
                </div>

                {/* Filters */}
                <div className="flex flex-col sm:flex-row gap-4">
                    <SearchBar
                        placeholder="Search by customer, phone, reg number..."
                        value={search}
                        onChange={setSearch}
                    />
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
                                <Card className="hover:shadow-md transition-shadow cursor-pointer border-warning/20">
                                    <CardContent className="p-4">
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <h3 className="font-semibold text-lg">
                                                        {job.bike?.registration_number}
                                                    </h3>
                                                    <StatusBadge status={job.status} />
                                                    <StatusBadge status={job.payment_status} type="payment" />
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
                                                            <div className="bg-warning/10 px-2 py-1 rounded border border-warning/20 mt-1">
                                                                <p className="text-lg font-bold text-warning leading-none">
                                                                    Due: ₹{balance.toLocaleString()}
                                                                </p>
                                                            </div>
                                                            <div className="flex flex-col items-end mt-2 opacity-60">
                                                                <p className="text-[10px] text-muted-foreground leading-tight">
                                                                    {format(new Date(job.date_in), 'MMM d, yyyy')}
                                                                </p>
                                                                <p className="text-[10px] text-muted-foreground leading-tight">
                                                                    {formatDistanceToNow(new Date(job.date_in), { addSuffix: true })}
                                                                </p>
                                                            </div>
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
                        <CreditCard className="w-12 h-12 mx-auto mb-4 opacity-20" />
                        <p className="mb-2">
                            {search ? 'No pending payments found matching your criteria' : 'No pending payments! Great job.'}
                        </p>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
