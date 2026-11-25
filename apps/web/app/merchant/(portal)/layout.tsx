'use client';

import React from 'react';
import Link from 'next/link';
import { LayoutDashboard, ShoppingBag, UtensilsCrossed, Store } from 'lucide-react';
import { AppShell } from '@/components/layout/app-shell';
import { PortalShell } from '@/components/layout/portal-shell';
import { AccessGateCard, LoadingState } from '@/components/ui/state-views';
import { useAuth } from '@/lib/auth-context';
import { hasMerchantAccess } from '@/lib/roles';

export default function MerchantPortalLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <LoadingState label="Verifying merchant credentials..." count={1} />
      </div>
    );
  }

  if (!user || !hasMerchantAccess(user.roles)) {
    return (
      <AppShell maxWidth="5xl">
        <div className="py-6 space-y-4">
          <nav aria-label="Breadcrumb" className="text-xs text-muted-foreground flex items-center gap-1.5">
            <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
            <span>/</span>
            <span className="font-semibold text-foreground">Merchant Portal</span>
          </nav>
          <AccessGateCard
            title="Merchant Access Required"
            description="Sign in with an approved merchant or system administrator account to manage orders and menus, or apply to register your campus shop."
            showRegisterShop
            returnTo="/merchant/dashboard"
          />
        </div>
      </AppShell>
    );
  }

  return (
    <PortalShell
      portalLabel="Merchant navigation"
      portalBadge="MERCHANT"
      railClassName="bg-[#0F1F16]"
      navItems={[
        { href: '/merchant/dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
        { href: '/merchant/orders', label: 'Live Order Queue', icon: <ShoppingBag className="w-4 h-4" /> },
        { href: '/merchant/menu', label: 'Menu & Catalog', icon: <UtensilsCrossed className="w-4 h-4" /> },
      ]}
      footerTitle={user.displayName}
      footerSubtitle="Verified Campus Merchant Portal"
      footerIcon={<Store className="w-4 h-4 text-emerald-400 shrink-0" />}
    >
      {children}
    </PortalShell>
  );
}
