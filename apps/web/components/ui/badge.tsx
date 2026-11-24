import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  {
    variants: {
      variant: {
        default: 'border-primary/20 bg-primary-50 text-primary-800',
        secondary: 'border-secondary/25 bg-secondary-50 text-secondary-800',
        destructive: 'border-rose-200 bg-rose-50 text-rose-800',
        danger: 'border-rose-200 bg-rose-50 text-rose-800',
        outline: 'border-border bg-card text-foreground',
        muted: 'border-border bg-muted text-muted-foreground',
        success: 'border-emerald-200 bg-emerald-50 text-emerald-800',
        warning: 'border-amber-200 bg-amber-50 text-amber-900',
        info: 'border-teal-200 bg-teal-50 text-teal-800',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
