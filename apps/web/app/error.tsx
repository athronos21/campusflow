'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { AppShell } from '@/components/layout/app-shell';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RotateCcw } from 'lucide-react';

export default function GlobalErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('CampusFlow Web Error Boundary:', error);
  }, [error]);

  return (
    <AppShell maxWidth="5xl">
      <div className="rounded-2xl border border-border bg-card p-8 sm:p-12 text-center max-w-xl mx-auto my-8 space-y-5">
        <div className="w-12 h-12 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-destructive flex items-center justify-center mx-auto">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <div className="space-y-2">
          <h1 className="font-display text-2xl font-black tracking-tight text-foreground">
            Something interrupted this view
          </h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {error.message || 'An unexpected rendering issue occurred. You can retry safely or return to Campus Pulse.'}
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Button onClick={reset} className="w-full sm:w-auto">
            <RotateCcw className="w-4 h-4 mr-1.5" /> Try Again
          </Button>
          <Button asChild variant="outline" className="w-full sm:w-auto">
            <Link href="/">Return Home</Link>
          </Button>
        </div>
      </div>
    </AppShell>
  );
}
