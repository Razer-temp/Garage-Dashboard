import { cn } from '@/lib/utils';
import { JobStatus, PaymentStatus } from '@/types/database';

interface StatusBadgeProps {
  status: JobStatus | PaymentStatus;
  type?: 'job' | 'payment';
}

const jobStatusConfig: Record<JobStatus, { label: string; className: string }> = {
  pending: { label: 'Pending', className: 'bg-warning/10 text-warning border-warning/20' },
  in_progress: { label: 'In Progress', className: 'bg-info/10 text-info border-info/20' },
  ready_for_delivery: { label: 'Ready', className: 'bg-success/10 text-success border-success/20' },
  delivered: { label: 'Delivered', className: 'bg-muted text-muted-foreground border-border' },
};

const paymentStatusConfig: Record<PaymentStatus, { label: string; className: string }> = {
  pending: { label: 'Unpaid', className: 'bg-destructive/10 text-destructive border-destructive/20' },
  partial: { label: 'Partial', className: 'bg-warning/10 text-warning border-warning/20' },
  paid: { label: 'Paid', className: 'bg-success/10 text-success border-success/20' },
};

export function StatusBadge({ status, type = 'job' }: StatusBadgeProps) {
  const config = type === 'job' 
    ? jobStatusConfig[status as JobStatus] 
    : paymentStatusConfig[status as PaymentStatus];

  return (
    <span className={cn(
      'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border',
      config.className
    )}>
      {config.label}
    </span>
  );
}
