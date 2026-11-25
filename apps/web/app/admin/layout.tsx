'use client';

import React from 'react';
import Link from 'next/link';
import { ShieldCheck, AlertTriangle, ShieldAlert } from 'lucide-react';
import { AppShell } from '@/components/layout/app-shell';
import { PortalShell } from '@/components/layout/portal-shell';
import { AccessGateCard, LoadingState } from '@/components/ui/state-views';
import { useAuth } from '@/lib/auth-context';
import { hasAdminAccess } from '@/lib/roles';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <LoadingState label="Verifying administrator session..." count={1} />
      </div>
    );
  }

  if (!user || !hasAdminAccess(user.roles)) {
    return (
      <AppShell maxWidth="5xl">
        <div className="py-6 space-y-4">
          <nav aria-label="Breadcrumb" className="text-xs text-muted-foreground flex items-center gap-1.5">
            <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
            <span>/</span>
            <span className="font-semibold text-foreground">System Administration</span>
          </nav>
          <AccessGateCard
            title="System Administrator Access Required"
            description="This governance panel is restricted to verified CampusFlow administrators and moderators."
            returnTo="/admin/verifications"
          />
        </div>
      </AppShell>
    );
  }

  return (
    <PortalShell
      portalLabel="Admin navigation"
      portalBadge="ADMIN"
      railClassName="bg-[#171316]"
      navItems={[
        {
          href: '/admin/verifications',
          label: 'Merchant Verifications',
          icon: <ShieldCheck className="w-4 h-4" />,
        },
        {
          href: '/admin/complaints',
          label: 'Complaints & Reports',
          icon: <AlertTriangle className="w-4 h-4" />,
        },
      ]}
      footerTitle="System Governance"
      footerSubtitle="Haramaya University Administration"
      footerIcon={<ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />}
    >
      {children}
    </PortalShell>
  );
}
