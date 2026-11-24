'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { ArrowLeft, LogOut, Menu } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useAuth } from '@/lib/auth-context';
import { cn } from '@/lib/utils';

export interface PortalNavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
}

export interface PortalShellProps {
  children: React.ReactNode;
  portalLabel: string;
  portalBadge: string;
  railClassName?: string;
  navItems: PortalNavItem[];
  footerTitle: string;
  footerSubtitle: string;
  footerIcon: React.ReactNode;
}

export function PortalShell({
  children,
  portalLabel,
  portalBadge,
  railClassName = 'bg-[#0F1F16]',
  navItems,
  footerTitle,
  footerSubtitle,
  footerIcon,
}: PortalShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  const renderLinks = (onNavigate?: () => void) => (
    <nav aria-label={portalLabel} className="space-y-1.5 text-sm font-semibold">
      {navItems.map((item) => {
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              'min-h-[44px] flex items-center gap-3 px-3.5 rounded-xl transition-colors',
              isActive
                ? 'bg-primary-600 text-white'
                : 'text-stone-300 hover:bg-white/10 hover:text-white',
            )}
          >
            {item.icon}
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col lg:flex-row">
      {/* Mobile Top Header */}
      <header className={cn('lg:hidden sticky top-0 z-40 px-4 h-16 flex items-center justify-between text-white border-b border-white/10', railClassName)}>
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            aria-label="Open portal navigation"
            className="inline-flex h-11 w-11 items-center justify-center rounded-lg bg-white/10 text-white hover:bg-white/20"
          >
            <Menu className="h-5 w-5" />
          </button>
          <Link href="/" className="font-display font-black text-base tracking-tight text-white">
            CampusFlow
          </Link>
          <Badge variant="success" className="text-[10px]">
            {portalBadge}
          </Badge>
        </div>

        <Link href="/" className="text-xs font-semibold text-stone-300 hover:text-white">
          Student Hub
        </Link>
      </header>

      {/* Desktop Sidebar */}
      <aside className={cn('hidden lg:flex w-64 shrink-0 text-stone-100 flex-col justify-between p-6 border-r border-white/10', railClassName)}>
        <div>
          <div className="flex items-center justify-between gap-2 mb-8">
            <Link href="/" className="font-display font-black text-lg tracking-tight text-white">
              CampusFlow
            </Link>
            <Badge variant="success" className="text-[10px]">
              {portalBadge}
            </Badge>
          </div>

          {renderLinks()}

          <div className="mt-8 pt-5 border-t border-white/10 space-y-2">
            <Link
              href="/"
              className="min-h-[40px] flex items-center gap-2 text-xs font-semibold text-stone-300 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Student Hub</span>
            </Link>
            {user && (
              <button
                type="button"
                onClick={handleLogout}
                className="min-h-[40px] flex items-center gap-2 text-xs font-semibold text-rose-300 hover:text-rose-200 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out ({user.displayName})</span>
              </button>
            )}
          </div>
        </div>

        <div className="pt-4 border-t border-white/10 text-xs text-stone-300 space-y-1">
          <div className="flex items-center gap-2 font-bold text-white">
            {footerIcon}
            <span>{footerTitle}</span>
          </div>
          <p className="text-[11px] text-stone-400">{footerSubtitle}</p>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto max-w-6xl w-full">
        {children}
      </main>

      {/* Mobile Portal Drawer */}
      <Dialog open={mobileOpen} onOpenChange={setMobileOpen}>
        <DialogContent
          className={cn('max-w-sm border-white/15 text-stone-100', railClassName)}
          closeClassName="text-stone-300 hover:bg-white/10 hover:text-white"
        >
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <span>CampusFlow</span>
              <Badge variant="success">{portalBadge}</Badge>
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-5 py-1">
            {renderLinks(() => setMobileOpen(false))}

            <div className="pt-4 border-t border-white/10 flex flex-col gap-2">
              <Button asChild variant="outline" className="border-white/20 bg-white/10 text-white hover:bg-white/20">
                <Link href="/" onClick={() => setMobileOpen(false)}>
                  <ArrowLeft className="w-4 h-4 mr-1.5" /> Back to Student Hub
                </Link>
              </Button>
              {user && (
                <Button
                  type="button"
                  variant="destructive"
                  onClick={handleLogout}
                >
                  <LogOut className="w-4 h-4 mr-1.5" /> Sign Out
                </Button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
