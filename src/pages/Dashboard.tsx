import { Link } from 'react-router-dom';
import { Users, Briefcase, CreditCard, Bell, ArrowRight, Clock, Bike } from 'lucide-react';
import AppLayout from '@/components/layout/AppLayout';
import { StatCard } from '@/components/ui/stat-card';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/ui/status-badge';
import { useDashboardStats } from '@/hooks/useDashboard';
import { useJobs, useUpcomingReminders } from '@/hooks/useJobs';
import { format, formatDistanceToNow } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';

export default function Dashboard() {
  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  const { data: recentJobs, isLoading: jobsLoading } = useJobs();
  const { data: reminders, isLoading: remindersLoading } = useUpcomingReminders();

  const activeJobs = recentJobs?.filter(j => j.status !== 'delivered').slice(0, 5) ?? [];

  return (
    <AppLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">Welcome to your garage management system</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {statsLoading ? (
            <>
              <Skeleton className="h-32" />
              <Skeleton className="h-32" />
              <Skeleton className="h-32" />
              <Skeleton className="h-32" />
            </>
          ) : (
            <>
              <StatCard
                title="Total Customers"
                value={stats?.totalCustomers ?? 0}
                icon={Users}
                link="/customers"
              />
              <StatCard
                title="Active Jobs"
                value={stats?.activeJobs ?? 0}
                icon={Briefcase}
                link="/jobs?status=pending,in_progress"
              />
              <StatCard
                title="Pending Payments"
                value={stats?.pendingPayments ?? 0}
                icon={CreditCard}
                link="/pending-payments"
              />
              <StatCard
                title="Service Reminders"
                value={stats?.upcomingReminders ?? 0}
                icon={Bell}
                description="Next 30 days"
                link="/reminders"
              />
            </>
          )}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Jobs */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-4">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-accent" />
                Recent Work Orders
              </CardTitle>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/jobs" className="flex items-center gap-1">
                  View all <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              {jobsLoading ? (
                <div className="space-y-3">
                  <Skeleton className="h-16" />
                  <Skeleton className="h-16" />
                  <Skeleton className="h-16" />
                </div>
              ) : activeJobs.length > 0 ? (
                <div className="space-y-3">
                  {activeJobs.map((job) => (
                    <Link
                      key={job.id}
                      to={`/jobs/${job.id}`}
                      className="block p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <Bike className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                            <span className="font-medium truncate">
                              {job.bike?.registration_number}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground truncate mt-1">
                            {job.bike?.customer?.name} • {job.bike?.make_model}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {job.problem_description?.slice(0, 50)}...
                          </p>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <StatusBadge status={job.status} />
                          <span className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(job.date_in), { addSuffix: true })}
                          </span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Briefcase className="w-12 h-12 mx-auto mb-2 opacity-20" />
                  <p>No active work orders</p>
                  <Button variant="link" asChild className="mt-2">
                    <Link to="/jobs/new">Create your first work order</Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Upcoming Reminders */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-4">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <Bell className="w-5 h-5 text-accent" />
                Service Reminders
              </CardTitle>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/reminders" className="flex items-center gap-1">
                  View all <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              {remindersLoading ? (
                <div className="space-y-3">
                  <Skeleton className="h-16" />
                  <Skeleton className="h-16" />
                  <Skeleton className="h-16" />
                </div>
              ) : reminders && reminders.length > 0 ? (
                <div className="space-y-3">
                  {reminders.slice(0, 5).map((reminder) => (
                    <div
                      key={reminder.id}
                      className="p-3 rounded-lg border bg-card"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-warning flex-shrink-0" />
                            <span className="font-medium truncate">
                              {reminder.bike?.customer?.name}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            {reminder.bike?.make_model} • {reminder.bike?.registration_number}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-warning">
                            {reminder.next_service_date && format(new Date(reminder.next_service_date), 'MMM d, yyyy')}
                          </p>
                          {reminder.next_service_mileage && (
                            <p className="text-xs text-muted-foreground">
                              or {reminder.next_service_mileage.toLocaleString()} km
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Bell className="w-12 h-12 mx-auto mb-2 opacity-20" />
                  <p>No upcoming reminders</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              <Button asChild className="gradient-accent text-accent-foreground">
                <Link to="/customers/new">
                  <Users className="w-4 h-4 mr-2" />
                  Add Customer
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link to="/jobs/new">
                  <Briefcase className="w-4 h-4 mr-2" />
                  New Work Order
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
