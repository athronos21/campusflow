import React from 'react';
import Link from 'next/link';
import { AppShell } from '@/components/layout/app-shell';
import { Button } from '@/components/ui/button';
import { Compass, ArrowLeft } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <AppShell maxWidth="5xl">
      <div className="rounded-2xl border border-border bg-card p-8 sm:p-12 text-center max-w-xl mx-auto my-8 space-y-5">
        <div className="w-12 h-12 rounded-xl bg-muted text-primary flex items-center justify-center mx-auto font-mono text-sm font-black">
          404
        </div>
        <div className="space-y-2">
          <h1 className="font-display text-2xl sm:text-3xl font-black tracking-tight text-foreground">
            Campus page not found
          </h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            The link you followed may have moved or the shop/pass ID is no longer active.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Button asChild className="w-full sm:w-auto">
            <Link href="/">
              <ArrowLeft className="w-4 h-4 mr-1.5" /> Back to Campus Pulse
            </Link>
          </Button>
          <Button asChild variant="outline" className="w-full sm:w-auto">
            <Link href="/directory">
              <Compass className="w-4 h-4 mr-1.5" /> Browse Directory
            </Link>
          </Button>
        </div>
      </div>
    </AppShell>
  );
}
