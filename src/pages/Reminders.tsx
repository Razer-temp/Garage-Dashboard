import { Link } from 'react-router-dom';
import { Bell, Calendar, Phone, MessageCircle, Bike } from 'lucide-react';
import AppLayout from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useUpcomingReminders } from '@/hooks/useJobs';
import { CommunicationDialog } from '@/components/CommunicationDialog';
import { Skeleton } from '@/components/ui/skeleton';
import { format, differenceInDays, isToday, isTomorrow, isPast } from 'date-fns';

export default function Reminders() {
  const { data: reminders, isLoading } = useUpcomingReminders();

  const getUrgencyClass = (dateStr: string) => {
    const date = new Date(dateStr);
    const daysUntil = differenceInDays(date, new Date());

    if (isPast(date) || isToday(date)) return 'border-l-destructive bg-destructive/5';
    if (isTomorrow(date) || daysUntil <= 3) return 'border-l-warning bg-warning/5';
    if (daysUntil <= 7) return 'border-l-info bg-info/5';
    return 'border-l-muted-foreground';
  };

  const getUrgencyLabel = (dateStr: string) => {
    const date = new Date(dateStr);
    const daysUntil = differenceInDays(date, new Date());

    if (isPast(date)) return 'Overdue';
    if (isToday(date)) return 'Today';
    if (isTomorrow(date)) return 'Tomorrow';
    if (daysUntil <= 7) return `In ${daysUntil} days`;
    return format(date, 'MMM d, yyyy');
  };

  return (
    <AppLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">Service Reminders</h1>
          <p className="text-muted-foreground">Upcoming service due in the next 30 days</p>
        </div>

        {/* Reminders List */}
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
          </div>
        ) : reminders && reminders.length > 0 ? (
          <div className="space-y-4">
            {reminders.map((reminder) => (
              <Card
                key={reminder.id}
                className={`border-l-4 ${getUrgencyClass(reminder.next_service_date!)}`}
              >
                <CardContent className="p-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center">
                          <Bike className="w-5 h-5 text-accent" />
                        </div>
                        <div>
                          <h3 className="font-semibold">{reminder.bike?.customer?.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {reminder.bike?.registration_number} • {reminder.bike?.make_model}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-3 mt-3">
                        <a
                          href={`tel:${reminder.bike?.customer?.phone}`}
                          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
                        >
                          <Phone className="w-4 h-4" />
                          {reminder.bike?.customer?.phone}
                        </a>
                        {reminder.bike?.customer?.whatsapp && (
                          <CommunicationDialog
                            customer={{
                              id: reminder.bike.customer.id,
                              name: reminder.bike.customer.name,
                              phone: reminder.bike.customer.phone,
                            }}
                            bike_model={reminder.bike.make_model}
                            reg_number={reminder.bike.registration_number}
                            due_date={reminder.next_service_date || undefined}
                            trigger={
                              <button className="flex items-center gap-1 text-sm text-success hover:underline">
                                <MessageCircle className="w-4 h-4" />
                                Send Reminder
                              </button>
                            }
                          />
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-2">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-warning" />
                        <span className="font-semibold text-warning">
                          {getUrgencyLabel(reminder.next_service_date!)}
                        </span>
                      </div>
                      {reminder.next_service_mileage && (
                        <p className="text-sm text-muted-foreground">
                          or at {reminder.next_service_mileage.toLocaleString()} km
                        </p>
                      )}
                      <Button size="sm" variant="outline" asChild>
                        <Link to={`/jobs/new?bike=${reminder.bike_id}`}>
                          Create Work Order
                        </Link>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <Bell className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-20" />
              <p className="text-muted-foreground mb-2">No upcoming service reminders</p>
              <p className="text-sm text-muted-foreground">
                Reminders are automatically set when you create work orders with the reminder option enabled.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  );
}
