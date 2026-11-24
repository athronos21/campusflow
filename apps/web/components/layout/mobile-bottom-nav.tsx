'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Compass, Bus, Package, LayoutGrid, Home } from 'lucide-react';
import { cn } from '@/lib/utils';

export function MobileBottomNav({ onOpenMenu }: { onOpenMenu: () => void }) {
  const pathname = usePathname();

  const tabs = [
    { href: '/', label: 'Pulse', icon: Home },
    { href: '/directory', label: 'Directory', icon: Compass },
    { href: '/transport', label: 'Transport', icon: Bus },
    { href: '/orders', label: 'Orders', icon: Package },
  ];

  return (
    <nav
      aria-label="Mobile quick navigation"
      className="md:hidden fixed bottom-0 inset-x-0 z-40 border-t border-border bg-card/95 backdrop-blur-sm shadow-drawer"
    >
      <div className="grid grid-cols-5 h-16 px-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = tab.href === '/' ? pathname === '/' : pathname.startsWith(tab.href);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                'flex flex-col items-center justify-center gap-0.5 text-[11px] font-semibold transition-colors min-h-[44px]',
                isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground',
              )}
            >
              <Icon className="h-4 w-4" />
              <span>{tab.label}</span>
            </Link>
          );
        })}

        <button
          type="button"
          onClick={onOpenMenu}
          className="flex flex-col items-center justify-center gap-0.5 text-[11px] font-semibold text-muted-foreground hover:text-foreground min-h-[44px]"
        >
          <LayoutGrid className="h-4 w-4" />
          <span>More</span>
        </button>
      </div>
    </nav>
  );
}
