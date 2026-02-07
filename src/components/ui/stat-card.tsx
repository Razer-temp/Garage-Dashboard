import { LucideIcon, ArrowRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';
import { Button } from './button';

interface StatCardProps {
  title: string;
  value: number | string;
  icon: LucideIcon;
  description?: string;
  link?: string;
  className?: string;
}

export function StatCard({ title, value, icon: Icon, description, link, className }: StatCardProps) {
  return (
    <Card className={cn('relative overflow-hidden', className)}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-3xl font-bold text-foreground">{value}</p>
            {description && (
              <p className="text-xs text-muted-foreground">{description}</p>
            )}
          </div>
          <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center">
            <Icon className="w-6 h-6 text-accent" />
          </div>
        </div>
        {link && (
          <div className="mt-4 pt-4 border-t border-border/50">
            <Button variant="ghost" size="sm" asChild className="p-0 h-auto hover:bg-transparent text-accent hover:text-accent/80 transition-colors">
              <Link to={link} className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wider">
                View All <ArrowRight className="w-3 h-3" />
              </Link>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
