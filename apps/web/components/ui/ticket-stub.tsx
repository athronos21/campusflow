'use client';

import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { cn } from '@/lib/utils';

export interface TicketStubProps {
  badge?: React.ReactNode;
  title: string;
  subtitle?: string;
  code: string;
  qrValue: string;
  meta?: { label: string; value: string }[];
  footerLeft?: React.ReactNode;
  footerRight?: React.ReactNode;
  accent?: 'primary' | 'secondary' | 'ink';
  className?: string;
}

const HEADER_ACCENTS: Record<NonNullable<TicketStubProps['accent']>, string> = {
  primary: 'bg-primary text-primary-foreground',
  secondary: 'bg-secondary text-secondary-foreground',
  ink: 'bg-[#11241A] text-stone-100',
};

/**
 * Perforated Campus Pass / Ticket Stub shared across Student ID, Shuttles, Orders, Bookings, and Events.
 */
export function TicketStub({
  badge,
  title,
  subtitle,
  code,
  qrValue,
  meta = [],
  footerLeft,
  footerRight,
  accent = 'ink',
  className,
}: TicketStubProps) {
  return (
    <div className={cn('overflow-hidden rounded-2xl border border-border bg-card text-card-foreground', className)}>
      <div className={cn('px-5 py-4 flex items-start justify-between gap-3', HEADER_ACCENTS[accent])}>
        <div className="min-w-0">
          <div className="font-display text-base font-bold leading-tight truncate">{title}</div>
          {subtitle && <div className="mt-0.5 text-xs opacity-85 truncate">{subtitle}</div>}
        </div>
        {badge && <div className="shrink-0">{badge}</div>}
      </div>

      {meta.length > 0 && (
        <div className="grid grid-cols-2 gap-3 px-5 py-4 text-xs bg-card">
          {meta.map((entry) => (
            <div key={entry.label} className="min-w-0">
              <div className="text-[11px] font-medium text-muted-foreground">{entry.label}</div>
              <div className="mt-0.5 font-semibold text-foreground truncate">{entry.value}</div>
            </div>
          ))}
        </div>
      )}

      {/* Perforated Divider */}
      <div className="relative flex items-center bg-card">
        <span
          aria-hidden="true"
          className="-ml-2.5 h-5 w-5 rounded-full border border-border bg-background shrink-0"
        />
        <div className="w-full border-t border-dashed border-border mx-1" />
        <span
          aria-hidden="true"
          className="-mr-2.5 h-5 w-5 rounded-full border border-border bg-background shrink-0"
        />
      </div>

      {/* QR + Monospace Code Stub */}
      <div className="px-5 py-4 bg-muted/40 flex items-center justify-between gap-4">
        <div className="rounded-xl border border-border bg-white p-2 shrink-0">
          <QRCodeSVG value={qrValue} size={72} level="M" includeMargin={false} />
        </div>
        <div className="min-w-0 flex-1 text-right">
          <div className="text-[11px] font-medium text-muted-foreground">Verification Code</div>
          <div className="mt-1 inline-block rounded-md border border-border bg-card px-2.5 py-1 font-mono text-xs font-bold tracking-wider text-foreground tabular-nums">
            {code}
          </div>
          {(footerLeft || footerRight) && (
            <div className="mt-2.5 flex items-center justify-end gap-3 text-[11px] text-muted-foreground">
              {footerLeft}
              {footerRight}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
