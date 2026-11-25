import React from 'react';
import Link from 'next/link';
import { Lock, LogIn, ShieldAlert, Store } from 'lucide-react';
import { Card, CardContent } from './card';
import { Button } from './button';

export function LoadingState({ label = 'Loading...', count = 2 }: { label?: string; count?: number }) {
  return (
    <div className="space-y-4 py-4" aria-busy="true" aria-label={label}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Array.from({ length: count }).map((_, idx) => (
          <div
            key={idx}
            className="rounded-xl border border-border bg-card p-5 space-y-3 animate-pulse"
          >
            <div className="h-4 w-28 rounded bg-muted" />
            <div className="h-5 w-3/4 rounded bg-muted" />
            <div className="h-3.5 w-full rounded bg-muted" />
            <div className="h-9 w-32 rounded-lg bg-muted pt-2" />
          </div>
        ))}
      </div>
      <p className="text-center text-xs font-medium text-muted-foreground">{label}</p>
    </div>
  );
}

export interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
}

export function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  actionHref,
  onAction,
}: EmptyStateProps) {
  return (
    <Card className="text-center">
      <CardContent className="py-12 px-6 flex flex-col items-center">
        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl border border-border bg-muted text-muted-foreground">
          {icon}
        </div>
        <h3 className="font-display text-base font-bold text-foreground">{title}</h3>
        <p className="mt-1 max-w-md text-sm text-muted-foreground leading-relaxed">{description}</p>
        {actionLabel && actionHref && (
          <Button asChild variant="outline" size="sm" className="mt-4">
            <Link href={actionHref}>{actionLabel}</Link>
          </Button>
        )}
        {actionLabel && !actionHref && onAction && (
          <Button type="button" variant="outline" size="sm" onClick={onAction} className="mt-4">
            {actionLabel}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

export function AuthPromptCard({
  title,
  description,
  returnTo,
}: {
  title: string;
  description: string;
  returnTo?: string;
}) {
  const loginHref = returnTo ? `/login?next=${encodeURIComponent(returnTo)}` : '/login';
  return (
    <Card className="mx-auto max-w-lg text-center">
      <CardContent className="py-12 px-6 flex flex-col items-center">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl border border-primary/20 bg-primary-50 text-primary">
          <Lock className="h-5 w-5" />
        </div>
        <h2 className="font-display text-xl font-bold text-foreground">{title}</h2>
        <p className="mt-1.5 max-w-sm text-sm text-muted-foreground leading-relaxed">{description}</p>
        <div className="mt-5 flex flex-wrap items-center justify-center gap-2.5">
          <Button asChild>
            <Link href={loginHref}>
              <LogIn className="h-4 w-4 mr-2" />
              Sign In
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/register">Create Student Account</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export function AccessGateCard({
  title,
  description,
  showRegisterShop = false,
  returnTo,
}: {
  title: string;
  description: string;
  showRegisterShop?: boolean;
  returnTo?: string;
}) {
  const loginHref = returnTo ? `/login?next=${encodeURIComponent(returnTo)}` : '/login';

  return (
    <Card className="w-full max-w-lg mx-auto">
      <CardContent className="py-10 px-6 text-center flex flex-col items-center">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl border border-amber-200 bg-amber-50 text-amber-800">
          <ShieldAlert className="h-6 w-6" />
        </div>
        <h1 className="font-display text-2xl font-bold text-foreground">{title}</h1>
        <p className="mt-2 max-w-md text-sm text-muted-foreground leading-relaxed">{description}</p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-2.5">
          <Button asChild>
            <Link href={loginHref}>
              <LogIn className="h-4 w-4 mr-2" />
              Sign In with Authorized Account
            </Link>
          </Button>
          {showRegisterShop && (
            <Button asChild variant="secondary">
              <Link href="/merchant/register">
                <Store className="h-4 w-4 mr-2" />
                Register a Campus Shop
              </Link>
            </Button>
          )}
          <Button asChild variant="outline">
            <Link href="/">Return to Campus Hub</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
