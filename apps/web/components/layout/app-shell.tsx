'use client';

import React, { useState } from 'react';
import { Navbar } from './navbar';
import { Footer } from './footer';
import { MobileBottomNav } from './mobile-bottom-nav';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { useCart } from '@/lib/cart-context';
import { useToast } from '@/components/ui/toast';
import { cn } from '@/lib/utils';

export interface AppShellProps {
  children: React.ReactNode;
  maxWidth?: '5xl' | '6xl' | '7xl';
  className?: string;
}

const WIDTH_CLASSES: Record<NonNullable<AppShellProps['maxWidth']>, string> = {
  '5xl': 'max-w-5xl',
  '6xl': 'max-w-6xl',
  '7xl': 'max-w-7xl',
};

export function AppShell({
  children,
  maxWidth = '7xl',
  className,
}: AppShellProps) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { pendingConflict, confirmCartSwitch, cancelCartSwitch } = useCart();
  const { toast } = useToast();

  const handleConfirmSwitch = () => {
    const newShop = pendingConflict?.newItem.businessName || 'selected shop';
    confirmCartSwitch();
    toast({
      title: 'Cart updated',
      description: `Started a fresh order with ${newShop}.`,
      variant: 'success',
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground pb-16 md:pb-0">
      <Navbar externalDrawerOpen={drawerOpen} onExternalDrawerOpenChange={setDrawerOpen} />

      <main className={cn('w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 flex-1', WIDTH_CLASSES[maxWidth], className)}>
        {children}
      </main>

      <Footer />
      <MobileBottomNav onOpenMenu={() => setDrawerOpen(true)} />

      <ConfirmDialog
        open={Boolean(pendingConflict)}
        onOpenChange={(open) => {
          if (!open) cancelCartSwitch();
        }}
        title="Switch shop in your cart?"
        description={
          pendingConflict
            ? `Your cart currently has items from ${pendingConflict.existingBusinessName}. Replace them to start an order with ${pendingConflict.newItem.businessName}?`
            : ''
        }
        confirmLabel="Start New Order"
        cancelLabel="Keep Existing Cart"
        onConfirm={handleConfirmSwitch}
      />
    </div>
  );
}
