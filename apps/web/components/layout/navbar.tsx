'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { useAuth } from '@/lib/auth-context';
import { useCart } from '@/lib/cart-context';
import { getPrimaryRoleLabel } from '@/lib/roles';
import {
  PRIMARY_NAV_ITEMS,
  MORE_CAMPUS_ITEMS,
  MOBILE_DRAWER_SECTIONS,
  getRolePortalLinks,
} from '@/lib/navigation';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  ShoppingCart,
  Store,
  Shield,
  LogOut,
  Package,
  Clock,
  PhoneCall,
  Menu,
  ChevronDown,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export function Navbar({
  externalDrawerOpen,
  onExternalDrawerOpenChange,
}: {
  externalDrawerOpen?: boolean;
  onExternalDrawerOpenChange?: (open: boolean) => void;
}) {
  const { user, logout } = useAuth();
  const { itemCount } = useCart();
  const pathname = usePathname();
  const router = useRouter();
  const [internalDrawerOpen, setInternalDrawerOpen] = useState(false);
  const [eatTime, setEatTime] = useState('EAT');

  const drawerOpen = externalDrawerOpen ?? internalDrawerOpen;
  const setDrawerOpen = onExternalDrawerOpenChange ?? setInternalDrawerOpen;

  useEffect(() => {
    const updateClock = () => {
      try {
        const formatted = new Intl.DateTimeFormat('en-GB', {
          timeZone: 'Africa/Addis_Ababa',
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
        }).format(new Date());
        setEatTime(`${formatted} EAT`);
      } catch {
        setEatTime('EAT');
      }
    };
    updateClock();
    const timer = window.setInterval(updateClock, 30000);
    return () => window.clearInterval(timer);
  }, []);

  const handleLogout = async () => {
    await logout();
    setDrawerOpen(false);
    router.push('/login');
  };

  const getInitials = (name?: string) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((part) => part[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  const portalLinks = getRolePortalLinks(user?.roles);
  const primaryRole = getPrimaryRoleLabel(user?.roles);

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-card/95 backdrop-blur-sm">
      {/* Institutional Status & Emergency Strip */}
      <div className="bg-[#11241A] text-stone-200 text-xs px-4 sm:px-6 py-1.5">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <span className="h-2 w-2 rounded-full bg-emerald-400 shrink-0" aria-hidden="true" />
            <span className="font-semibold text-white truncate">Haramaya University</span>
            <span className="hidden sm:inline text-stone-400">&bull;</span>
            <span className="hidden sm:inline text-stone-300">Main Campus (Bate)</span>
          </div>

          <div className="flex items-center gap-3 text-stone-300">
            <span className="font-mono text-[11px] flex items-center gap-1 tabular-nums">
              <Clock className="w-3 h-3 text-stone-400" />
              <span>{eatTime}</span>
            </span>
            <span className="text-stone-600" aria-hidden="true">|</span>
            <a
              href="tel:0255530112"
              className="min-h-[44px] text-amber-300 hover:text-white font-semibold flex items-center gap-1 transition-colors px-1"
            >
              <PhoneCall className="w-3.5 h-3.5" />
              <span>Clinic 025-553-0112</span>
            </a>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <nav aria-label="Primary navigation" className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            aria-label="Open campus menu"
            className="md:hidden inline-flex h-11 w-11 items-center justify-center rounded-lg border border-border bg-background text-foreground hover:bg-accent transition-colors"
          >
            <Menu className="h-5 w-5" />
          </button>

          <Link
            href="/"
            className="font-display font-black text-lg sm:text-xl tracking-tight text-foreground flex items-center gap-2"
          >
            <span className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground text-xs font-black">
              CF
            </span>
            <span>
              Campus<span className="text-primary">Flow</span>
            </span>
          </Link>
        </div>

        {/* Desktop Primary Links */}
        <div className="hidden md:flex items-center gap-1 text-sm font-medium">
          {PRIMARY_NAV_ITEMS.map((item) => {
            const isActive = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'px-3 py-2 rounded-lg text-xs font-semibold transition-colors',
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent',
                )}
              >
                {item.label}
              </Link>
            );
          })}

          <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
              <button
                type="button"
                className={cn(
                  'inline-flex items-center gap-1 px-3 py-2 rounded-lg text-xs font-semibold transition-colors',
                  MORE_CAMPUS_ITEMS.some((item) => pathname.startsWith(item.href))
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent',
                )}
              >
                <span>More Campus</span>
                <ChevronDown className="h-3.5 w-3.5" />
              </button>
            </DropdownMenu.Trigger>
            <DropdownMenu.Portal>
              <DropdownMenu.Content
                align="start"
                sideOffset={8}
                className="z-50 w-64 rounded-xl border border-border bg-popover p-1.5 text-popover-foreground animate-in fade-in-0 zoom-in-95"
              >
                {MORE_CAMPUS_ITEMS.map((item) => (
                  <DropdownMenu.Item key={item.href} asChild>
                    <Link
                      href={item.href}
                      className="flex flex-col rounded-lg px-3 py-2 text-left outline-none hover:bg-accent focus:bg-accent transition-colors"
                    >
                      <span className="text-xs font-semibold text-foreground">{item.label}</span>
                      {item.description && (
                        <span className="text-[11px] text-muted-foreground">{item.description}</span>
                      )}
                    </Link>
                  </DropdownMenu.Item>
                ))}
                <DropdownMenu.Separator className="my-1 h-px bg-border" />
                <DropdownMenu.Item asChild>
                  <Link
                    href="/merchant/register"
                    className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold text-primary outline-none hover:bg-accent focus:bg-accent"
                  >
                    <Store className="h-3.5 w-3.5" />
                    <span>Open a Campus Shop</span>
                  </Link>
                </DropdownMenu.Item>
              </DropdownMenu.Content>
            </DropdownMenu.Portal>
          </DropdownMenu.Root>

          {user && (
            <Link
              href="/orders"
              className={cn(
                'px-3 py-2 rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 transition-colors',
                pathname.startsWith('/orders')
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent',
              )}
            >
              <Package className="h-3.5 w-3.5" />
              <span>My Orders</span>
            </Link>
          )}
        </div>

        {/* Right Actions: Role Portal Pills + Cart + Account */}
        <div className="flex items-center gap-2">
          {portalLinks.length > 0 && (
            <div className="hidden lg:flex items-center gap-1.5">
              {portalLinks.map((portal) => (
                <Link
                  key={portal.href}
                  href={portal.href}
                  className={cn(
                    'inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-semibold transition-colors',
                    portal.badge === 'ADMIN'
                      ? 'border-rose-200 bg-rose-50 text-rose-900 hover:bg-rose-100 dark:border-rose-900 dark:bg-rose-950/70 dark:text-rose-200 dark:hover:bg-rose-950'
                      : 'border-amber-200 bg-amber-50 text-amber-900 hover:bg-amber-100 dark:border-amber-900 dark:bg-amber-950/70 dark:text-amber-200 dark:hover:bg-amber-950',
                  )}
                >
                  {portal.badge === 'ADMIN' ? (
                    <Shield className="h-3.5 w-3.5" />
                  ) : (
                    <Store className="h-3.5 w-3.5" />
                  )}
                  <span>{portal.label}</span>
                </Link>
              ))}
            </div>
          )}

          <Link
            href="/cart"
            aria-label="View pickup cart"
            className="relative inline-flex min-h-[44px] sm:min-h-[38px] items-center gap-1.5 rounded-lg border border-border bg-background px-3 text-xs font-semibold text-foreground hover:bg-accent transition-colors"
          >
            <ShoppingCart className="h-4 w-4 text-primary" />
            <span className="hidden sm:inline">Cart</span>
            {itemCount > 0 && (
              <Badge variant="secondary" className="h-5 min-w-[20px] justify-center px-1.5 font-mono text-[10px] font-bold">
                {itemCount}
              </Badge>
            )}
          </Link>

          {user ? (
            <div className="flex items-center gap-1.5 pl-1.5 border-l border-border">
              <Link
                href="/profile"
                className="flex min-h-[44px] sm:min-h-[38px] items-center gap-2 rounded-lg px-1.5 py-1 hover:bg-accent transition-colors"
                title="Profile & Digital Student ID"
              >
                <Avatar className="h-8 w-8 border border-border bg-primary-50 dark:bg-primary-950">
                  <AvatarFallback className="text-xs font-bold bg-primary-50 text-primary dark:bg-primary-950 dark:text-primary-200">
                    {getInitials(user.displayName)}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden xl:flex flex-col text-left">
                  <span className="text-xs font-semibold leading-tight text-foreground truncate max-w-[120px]">
                    {user.displayName}
                  </span>
                  <span className="text-[10px] font-semibold text-primary">{primaryRole}</span>
                </div>
              </Link>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleLogout}
                aria-label="Sign out"
                title="Sign Out"
                className="text-destructive hover:bg-rose-50 dark:hover:bg-rose-950/50"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-1.5">
              <Button variant="outline" size="sm" asChild className="hidden sm:inline-flex">
                <Link href="/login">Sign In</Link>
              </Button>
              <Button size="sm" asChild>
                <Link href="/register">Sign Up</Link>
              </Button>
            </div>
          )}
        </div>
      </nav>

      {/* Mobile Navigation Drawer */}
      <Dialog open={drawerOpen} onOpenChange={setDrawerOpen}>
        <DialogContent className="max-w-sm p-5">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <span className="w-7 h-7 rounded-md bg-primary flex items-center justify-center text-primary-foreground text-xs font-black">
                CF
              </span>
              <span>CampusFlow Navigation</span>
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-5 py-1">
            {MOBILE_DRAWER_SECTIONS.map((section) => (
              <div key={section.title} className="space-y-1.5">
                <div className="text-xs font-bold text-muted-foreground">{section.title}</div>
                <div className="grid grid-cols-1 gap-1">
                  {section.items.map((item) => {
                    const isActive = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setDrawerOpen(false)}
                        className={cn(
                          'min-h-[44px] flex items-center justify-between rounded-lg px-3 text-sm font-medium transition-colors',
                          isActive
                            ? 'bg-primary text-primary-foreground font-semibold'
                            : 'bg-muted/50 text-foreground hover:bg-accent',
                        )}
                      >
                        <span>{item.label}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}

            {portalLinks.length > 0 && (
              <div className="space-y-1.5 pt-2 border-t border-border">
                <div className="text-xs font-bold text-muted-foreground">Role Portals</div>
                <div className="grid grid-cols-1 gap-1.5">
                  {portalLinks.map((portal) => (
                    <Link
                      key={portal.href}
                      href={portal.href}
                      onClick={() => setDrawerOpen(false)}
                      className="min-h-[44px] flex items-center justify-between rounded-lg border border-border bg-card px-3 text-sm font-semibold text-foreground hover:bg-accent"
                    >
                      <span>{portal.label}</span>
                      <Badge variant={portal.badge === 'ADMIN' ? 'danger' : 'warning'}>{portal.badge}</Badge>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {!user && (
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border">
                <Button asChild variant="outline" onClick={() => setDrawerOpen(false)}>
                  <Link href="/login">Sign In</Link>
                </Button>
                <Button asChild onClick={() => setDrawerOpen(false)}>
                  <Link href="/register">Sign Up</Link>
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </header>
  );
}
